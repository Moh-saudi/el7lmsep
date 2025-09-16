import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import crypto from 'crypto';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// تكوين Geidea
const GEIDEA_CONFIG = {
  webhookSecret: process.env['GEIDEA_WEBHOOK_SECRET'] || '',
  baseUrl: process.env['GEIDEA_BASE_URL'] || 'https://api.merchant.geidea.net'
};

// معالج الاستجابة
const responseHandler = createResponseHandler();

// قواعد التحقق من البيانات
const validationRules = {
  orderId: (id: any) => id && typeof id === 'string',
  merchantReferenceId: (id: any) => id && typeof id === 'string'
};

// التحقق من صحة التوقيع
function verifySignature(payload: string, signature: string): boolean {
  if (!GEIDEA_CONFIG.webhookSecret) {
    console.error('🚨 SECURITY: GEIDEA_WEBHOOK_SECRET غير محدد - رفض الطلب');
    return false;
  }

  if (!signature || typeof signature !== 'string') {
    console.error('🚨 SECURITY: توقيع غير صالح');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', GEIDEA_CONFIG.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    const cleanSignature = signature.replace(/^sha256=/, '');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      console.error('🚨 SECURITY: فشل التحقق من التوقيع - طلب مرفوض');
    }

    return isValid;
  } catch (error) {
    console.error('🚨 SECURITY: خطأ في التحقق من التوقيع:', error);
    return false;
  }
}

// التحقق من Rate Limiting
function checkRateLimit(clientIp: string) {
  const ipCheck = rateLimiter.check(`geidea:webhook:${clientIp}`, { 
    windowMs: 60_000, 
    max: 100, 
    minIntervalMs: 100 
  });
  
  if (!ipCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      )
    };
  }
  
  return { allowed: true };
}

// استخراج بيانات الطلب
function extractOrderData(body: any) {
  const order = body.order;
  if (!order) {
    throw new Error('Missing order data');
  }

  const {
    orderId,
    merchantReferenceId,
    amount,
    currency,
    status,
    detailedStatus,
    totalAmount,
    settleAmount,
    createdDate,
    updatedDate,
    customerEmail,
    customerName,
    customerPhoneNumber,
    customerPhoneCountryCode,
    paymentMethod,
    transactions
  } = order;

  return {
    orderId,
    merchantReferenceId,
    amount: totalAmount || amount,
    currency,
    status: detailedStatus || status,
    paymentMethod: paymentMethod?.type || 'Unknown',
    customerEmail,
    customerName,
    customerPhoneNumber,
    customerPhoneCountryCode,
    createdDate,
    updatedDate,
    settleAmount,
    transactions
  };
}

// إنشاء بيانات الدفع
function createPaymentData(orderData: any) {
  return {
    orderId: orderData.orderId,
    merchantReferenceId: orderData.merchantReferenceId,
    amount: orderData.amount,
    currency: orderData.currency,
    status: orderData.status,
    paymentMethod: orderData.paymentMethod,
    customerEmail: orderData.customerEmail,
    customerName: orderData.customerName,
    customerPhoneNumber: orderData.customerPhoneNumber,
    customerPhoneCountryCode: orderData.customerPhoneCountryCode,
    createdDate: orderData.createdDate,
    updatedDate: orderData.updatedDate,
    settleAmount: orderData.settleAmount,
    transactions: orderData.transactions,
    processedAt: new Date()
  };
}

// حفظ بيانات الدفع
async function savePaymentData(paymentData: any) {
  const paymentsRef = collection(db, 'geideaPayments');
  await addDoc(paymentsRef, paymentData);
  console.log('✅ [Geidea Webhook] Payment data saved to Firestore');
}

// تحديث حالة الدفع
async function updatePaymentStatus(merchantReferenceId: string, status: string) {
  try {
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('merchantReferenceId', '==', merchantReferenceId)
    );
    
    const querySnapshot = await getDocs(paymentsQuery);
    
    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      await updateDoc(paymentDoc.ref, {
        status,
        updatedAt: new Date()
      });
      console.log('✅ [Geidea Webhook] Payment status updated');
    }
  } catch (error) {
    console.error('❌ [Geidea Webhook] Error updating payment status:', error);
  }
}

// معالجة webhook
async function processWebhook(body: any) {
  const orderData = extractOrderData(body);
  
  // التحقق من البيانات المطلوبة
  const validation = validateInput(orderData, validationRules);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Missing required fields');
  }

  const paymentData = createPaymentData(orderData);
  
  await savePaymentData(paymentData);
  await updatePaymentStatus(orderData.merchantReferenceId, orderData.status);
  
  return {
    success: true,
    orderId: orderData.orderId,
    merchantReferenceId: orderData.merchantReferenceId,
    status: orderData.status
  };
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

    const body = await request.json();
    console.log('🔔 [Geidea Webhook] Received webhook:', body);

    // التحقق من التوقيع
    const signature = request.headers.get('x-geidea-signature');
    const payload = JSON.stringify(body);
    
    if (!verifySignature(payload, signature || '')) {
      console.error('🚨 SECURITY: Invalid webhook signature');
      return NextResponse.json(
        responseHandler.error('Invalid signature'),
        { status: 401 }
      );
    }

    // معالجة webhook
    const result = await processWebhook(body);
    
    return NextResponse.json(responseHandler.success(result, 'Webhook processed successfully'));

  }, 'Geidea Webhook API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      return NextResponse.json(
        responseHandler.error(result.error || 'خطأ في معالجة webhook'),
        { status: 500 }
      );
    }
  });
}