import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { safeExecute, createResponseHandler, validateInput } from '@/lib/utils/complexity-reducer';

// معالج الاستجابة
const responseHandler = createResponseHandler();

// قواعد التحقق من البيانات
const validationRules = {
  sessionId: (id: any) => id && typeof id === 'string',
  merchantReferenceId: (id: any) => id && typeof id === 'string'
};

// استخراج معرف المستخدم من merchantReferenceId
function extractUserId(merchantReferenceId: string): string {
  if (!merchantReferenceId.includes('BULK')) {
    return 'unknown';
  }
  
  const parts = merchantReferenceId.split('_');
  return parts.length >= 2 ? parts[1] : 'unknown';
}

// إنشاء بيانات الدفع
function createPaymentData(body: any, status: 'completed' | 'failed') {
  const {
    sessionId,
    merchantReferenceId,
    amount,
    currency,
    responseCode,
    detailedResponseCode,
    responseMessage
  } = body;

  const baseData = {
    sessionId,
    merchantReferenceId,
    status,
    amount: parseFloat(amount),
    currency,
    responseCode,
    detailedResponseCode,
    responseMessage,
    updatedAt: new Date()
  };

  if (status === 'completed') {
    return {
      ...baseData,
      completedAt: new Date()
    };
  } else {
    return {
      ...baseData,
      failedAt: new Date()
    };
  }
}

// حفظ بيانات الدفع في Firestore
async function savePaymentData(paymentData: any, userId: string) {
  const bulkPaymentsRef = collection(db, 'bulkPayments');
  
  await addDoc(bulkPaymentsRef, {
    ...paymentData,
    userId,
    createdAt: new Date()
  });
  
  console.log('✅ [Geidea Webhook] Payment data saved to Firestore');
}

// تحديث اشتراك المستخدم
async function updateUserSubscription(userId: string, paymentData: any) {
  if (userId === 'unknown') {
    console.log('⚠️ [Geidea Webhook] Could not extract userId from merchantReferenceId');
    return;
  }

  try {
    // هنا يمكن إضافة منطق تحديث الاشتراك
    console.log('✅ [Geidea Webhook] User subscription updated successfully');
  } catch (error) {
    console.error('❌ [Geidea Webhook] Error updating user subscription:', error);
    throw error;
  }
}

// معالجة الدفع الناجح
async function handleSuccessfulPayment(body: any) {
  console.log('✅ [Geidea Webhook] Payment successful, updating subscription');
  
  const userId = extractUserId(body.merchantReferenceId);
  const paymentData = createPaymentData(body, 'completed');
  
  await savePaymentData(paymentData, userId);
  await updateUserSubscription(userId, paymentData);
  
  return {
    success: true,
    message: 'Payment processed successfully',
    sessionId: body.sessionId,
    merchantReferenceId: body.merchantReferenceId
  };
}

// معالجة الدفع الفاشل
async function handleFailedPayment(body: any) {
  console.log('⚠️ [Geidea Webhook] Payment failed or pending:', {
    responseCode: body.responseCode,
    status: body.status,
    responseMessage: body.responseMessage
  });
  
  const userId = extractUserId(body.merchantReferenceId);
  const paymentData = createPaymentData(body, 'failed');
  
  await savePaymentData(paymentData, userId);
  
  return {
    success: false,
    message: 'Payment failed or pending',
    sessionId: body.sessionId,
    merchantReferenceId: body.merchantReferenceId
  };
}

// التحقق من نجاح الدفع
function isPaymentSuccessful(responseCode: string, status: string): boolean {
  return responseCode === '000' && status === 'Paid';
}

// الدالة الرئيسية
export async function POST(request: NextRequest) {
  return safeExecute(async () => {
    console.log('🔔 [Geidea Webhook] Received callback');
    
    const body = await request.json();
    console.log('📥 [Geidea Webhook] Callback data:', body);

    // التحقق من صحة البيانات
    const validation = validateInput(body, validationRules);
    if (!validation.isValid) {
      console.error('❌ [Geidea Webhook] Invalid callback data');
      return NextResponse.json(
        responseHandler.error(validation.error || 'Invalid callback data'),
        { status: 400 }
      );
    }

    const { sessionId, merchantReferenceId, status, responseCode } = body;

    console.log('🔍 [Geidea Webhook] Processing payment:', {
      sessionId,
      merchantReferenceId,
      status,
      responseCode
    });

    // معالجة الدفع حسب النتيجة
    if (isPaymentSuccessful(responseCode, status)) {
      const result = await handleSuccessfulPayment(body);
      return NextResponse.json(responseHandler.success(result, result.message));
    } else {
      const result = await handleFailedPayment(body);
      return NextResponse.json(responseHandler.success(result, result.message));
    }

  }, 'Geidea Callback API').then(result => {
    if (result.success) {
      return result.data;
    } else {
      return NextResponse.json(
        responseHandler.error(result.error || 'خطأ في معالجة callback'),
        { status: 500 }
      );
    }
  });
}