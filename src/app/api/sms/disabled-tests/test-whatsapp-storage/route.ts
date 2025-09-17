import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { storeOTP, getOTP, getOTPBySource, getOTPStatus } from '../../otp-storage';
=======
import { storeOTP, getOTP, getOTPBySource, getOTPStatus } from '../otp-storage';
>>>>>>> 4fd1f89c5176de586b34609dd3d584ad2f178bd9

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    console.log('🧪 Test WhatsApp storage for:', { phone, otp });

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    // تخزين OTP WhatsApp
    storeOTP(phone, otp, 'whatsapp');
    console.log('💾 Test OTP stored for WhatsApp');

    // فحص التخزين
    await getOTPStatus();

    // محاولة استرجاع OTP
    const retrievedOTP = await getOTP(phone);
    const whatsappOTP = await getOTPBySource(phone, 'whatsapp');

    return NextResponse.json({
      success: true,
      message: 'Test OTP stored successfully',
      phone,
      otp,
      retrievedOTP: retrievedOTP ? {
        otp: retrievedOTP.otp,
        source: retrievedOTP.source,
        timestamp: retrievedOTP.timestamp
      } : null,
      whatsappOTP: whatsappOTP ? {
        otp: whatsappOTP.otp,
        source: whatsappOTP.source,
        timestamp: whatsappOTP.timestamp
      } : null
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
} 
