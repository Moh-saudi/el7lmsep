import { NextRequest, NextResponse } from 'next/server';
import { beonTemplateService } from '@/lib/beon';

export async function POST(request: NextRequest) {
  try {
    const { name, message, lang = 'ar', type } = await request.json();

    if (!name || !message) {
      return NextResponse.json(
        { success: false, error: 'الاسم والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    console.log('📝 إنشاء قالب:', { name, lang, messageLength: message.length, type });

    let result;

    // إنشاء قالب حسب النوع
    switch (type) {
      case 'otp':
        result = await beonTemplateService.createOTPTemplate(name, lang);
        break;
      case 'welcome':
        result = await beonTemplateService.createWelcomeTemplate(name, lang);
        break;
      case 'notification':
        result = await beonTemplateService.createNotificationTemplate(name, lang);
        break;
      default:
        result = await beonTemplateService.createTemplate(name, message, lang);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error, details: result.data },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ خطأ في API Templates:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء القالب' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'BeOn V3 Templates API',
    endpoints: {
      POST: 'إنشاء قالب جديد',
      parameters: {
        name: 'اسم القالب',
        message: 'نص القالب (يمكن استخدام {{v1}}, {{v2}} للمتغيرات)',
        lang: 'لغة القالب (افتراضي: ar)',
        type: 'نوع القالب (otp, welcome, notification) - اختياري'
      },
      examples: {
        custom: {
          name: 'My Template',
          message: 'مرحباً {{v1}}، رسالتك: {{v2}}',
          lang: 'ar'
        },
        otp: {
          name: 'OTP Template',
          type: 'otp',
          lang: 'ar'
        },
        welcome: {
          name: 'Welcome Template',
          type: 'welcome',
          lang: 'ar'
        }
      }
    }
  });
}

















