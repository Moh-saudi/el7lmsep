import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';
import { db } from '@/lib/firebase/config';
import { addDoc, collection } from 'firebase/firestore';
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// إعدادات Geidea
const GEIDEA_CONFIG = {
  merchantPublicKey: process.env.GEIDEA_MERCHANT_PUBLIC_KEY || '3448c010-87b1-41e7-9771-cac444268cfb',
  apiPassword: process.env.GEIDEA_API_PASSWORD || 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0',
  baseUrl: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net'
};

// معالج الاستجابة
const responseHandler = createResponseHandler();

// قواعد التحقق من البيانات
const validationRules = {
  amount: (amount: any) => amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0,
  orderId: (orderId: any) => orderId && typeof orderId === 'string',
  customerEmail: (email: any) => email && typeof email === 'string' && email.includes('@')
};

// إنشاء توقيع للطلب
function generateSignature(
  merchantPublicKey: string,
  amount: number,
  currency: string,
  merchantReferenceId: string,
  apiPassword: string,
  timestamp: string
): string {
  const amountStr = amount.toFixed(2);
  const data = `${merchantPublicKey}${amountStr}${currency}${merchantReferenceId}${timestamp}`;
  return crypto
    .createHmac('sha256', apiPassword)
    .update(data)
    .digest('base64');
}

// التحقق من Rate Limiting
function checkRateLimit(clientIp: string) {
  const ipCheck = rateLimiter.check(`geidea:create:${clientIp}`, { 
    windowMs: 60_000, 
    max: 20, 
    minIntervalMs: 300 
  });
  
  if (!ipCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      )
    };
  }
  
  return { allowed: true };
}

// معالجة بيانات اللاعبين
function processPlayersData(players: any[], amount: number, customerEmail: string) {
  if (!players || !Array.isArray(players) || players.length === 0) {
    return [];
  }

  return players.map(player => ({
    userId: player.userId || 'unknown',
    playerName: player.playerName || 'Unknown Player',
    playerEmail: player.playerEmail || customerEmail,
    playerPhone: player.playerPhone || null,
    amount: player.amount || (amount / players.length),
    packageType: player.packageType || 'subscription_3months',
    notes: player.notes || ''
  }));
}

// إنشاء بيانات الجلسة
function createSessionData(amount: number, currency: string, merchantReferenceId: string, timestamp: string, signature: string) {
  const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const sessionData: any = {
    amount: parseFloat(amount),
    currency: currency,
    timestamp: timestamp,
    merchantReferenceId: merchantReferenceId,
    signature: signature,
    language: "ar",
    paymentOperation: "Pay"
  };

  // إعداد URLs
  if (appBaseUrl.includes('localhost')) {
    sessionData.callbackUrl = 'https://webhook.site/test-geidea-callback-2025';
  } else {
    sessionData.callbackUrl = 'https://www.el7lm.com/api/geidea/webhook';
    sessionData.returnUrl = `${appBaseUrl}/dashboard/player/billing?payment=success`;
  }

  return sessionData;
}

// إرسال طلب إلى Geidea
async function sendGeideaRequest(sessionData: any) {
  const geideaEndpoint = `${GEIDEA_CONFIG.baseUrl}/payment-intent/api/v2/direct/session`;
  
  console.log('🌐 [Geidea API] Sending request to:', geideaEndpoint);
  
  const response = await fetch(geideaEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${GEIDEA_CONFIG.merchantPublicKey}:${GEIDEA_CONFIG.apiPassword}`).toString('base64')}`
    },
    body: JSON.stringify(sessionData)
  });

  const responseData = await response.json();
  
  console.log('📨 Geidea response:', {
    status: response.status,
    responseCode: responseData.responseCode,
    sessionId: responseData.session?.id,
    error: responseData.detailedResponseMessage || responseData.responseMessage
  });

  return { response, responseData };
}

// معالجة استجابة Geidea
function handleGeideaResponse(response: Response, responseData: any) {
  if (!response.ok) {
    if (response.status === 401) {
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: 'Merchant credentials are invalid or missing. Please check your Geidea configuration.',
          status: response.status,
          responseData: responseData
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment session',
        details: responseData.detailedResponseMessage || responseData.responseMessage || 'Unknown error',
        status: response.status,
        responseData: responseData
      },
      { status: response.status }
    );
  }

  if (responseData.responseCode !== '000') {
    if (responseData.responseCode === '100' && responseData.detailedResponseCode === '023') {
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: 'Merchant authentication failed. Please check your Geidea credentials.',
          responseCode: responseData.responseCode,
          detailedResponseCode: responseData.detailedResponseCode,
          responseData: responseData
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Payment session creation failed',
        details: responseData.detailedResponseMessage || responseData.responseMessage || 'Unknown error',
        responseCode: responseData.responseCode,
        responseData: responseData
      },
      { status: 400 }
    );
  }

  return null; // نجح
}

// حفظ بيانات الدفع
async function savePaymentData(sessionData: any, responseData: any, playersData: any[]) {
  try {
    const paymentData = {
      sessionId: responseData.session?.id,
      merchantReferenceId: sessionData.merchantReferenceId,
      amount: sessionData.amount,
      currency: sessionData.currency,
      customerEmail: sessionData.customerEmail,
      customerName: sessionData.customerName,
      players: playersData,
      status: 'pending',
      createdAt: new Date(),
      geideaResponse: responseData
    };

    await addDoc(collection(db, 'payments'), paymentData);
    console.log('💾 Payment data saved to Firestore');
  } catch (error) {
    console.error('❌ Failed to save payment data:', error);
    // لا نوقف العملية إذا فشل الحفظ
  }
}

// الدالة الرئيسية
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    const clientIp = getClientIpFromHeaders(request.headers);
    
    // التحقق من Rate Limiting
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    console.log('🚀 [Geidea API] POST request received');
    
    // قراءة البيانات من الطلب
    const body = await request.json();
    console.log('📥 [Geidea API] Received body:', body);

    const { amount, currency = 'EGP', orderId: originalOrderId, customerEmail, customerName, players } = body;
    
    // تنظيف وتنسيق orderId
    const orderId = originalOrderId || `ORDER${Date.now()}`;

    // التحقق من البيانات المطلوبة
    const validation = validateInput({ amount, orderId, customerEmail }, validationRules);
    if (!validation.isValid) {
      return NextResponse.json(
        responseHandler.error(validation.error || 'Missing required fields: amount, orderId, customerEmail'),
        { status: 400 }
      );
    }

    // معالجة بيانات اللاعبين
    const playersData = processPlayersData(players, amount, customerEmail);

    console.log('🔍 [Geidea Debug] Using PRODUCTION credentials');

    // إنشاء timestamp و merchantReferenceId
    const timestamp = new Date().toISOString();
    const shortTimestamp = Date.now().toString().slice(-6);
    const merchantReferenceId = `BULK${shortTimestamp}`;

    // إنشاء التوقيع
    const signature = generateSignature(
      GEIDEA_CONFIG.merchantPublicKey,
      parseFloat(amount),
      currency,
      merchantReferenceId,
      GEIDEA_CONFIG.apiPassword,
      timestamp
    );

    // إنشاء بيانات الجلسة
    const sessionData = createSessionData(amount, currency, merchantReferenceId, timestamp, signature);
    sessionData.customerEmail = customerEmail;
    sessionData.customerName = customerName;

    console.log('🚀 💳 Creating Geidea session:', {
      amount: sessionData.amount,
      currency: sessionData.currency,
      merchantReferenceId: sessionData.merchantReferenceId,
      callbackUrl: sessionData.callbackUrl,
      returnUrl: sessionData.returnUrl
    });

    // إرسال طلب إلى Geidea
    const { response, responseData } = await sendGeideaRequest(sessionData);

    // معالجة الاستجابة
    const errorResponse = handleGeideaResponse(response, responseData);
    if (errorResponse) {
      return errorResponse;
    }

    // حفظ بيانات الدفع
    await savePaymentData(sessionData, responseData, playersData);

    // إرجاع النجاح
    return NextResponse.json(responseHandler.success({
      sessionId: responseData.session?.id,
      merchantReferenceId: sessionData.merchantReferenceId,
      amount: sessionData.amount,
      currency: sessionData.currency,
      paymentUrl: responseData.session?.url,
      players: playersData
    }, 'Payment session created successfully'));

  }, 'Geidea Create Session API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      return NextResponse.json(
        responseHandler.error(result.error || 'خطأ في الخادم. يرجى المحاولة مرة أخرى.'),
        { status: 500 }
      );
    }
  });
}