/**
 * BeOn V3 SMS Service
 * خدمة الرسائل النصية BeOn V3
 */

import { BEON_V3_CONFIG, createBeOnHeaders, BeOnResponse, SMSBulkRequest } from './config';

export class BeOnSMSService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = BEON_V3_CONFIG.BASE_URL;
    this.token = BEON_V3_CONFIG.TOKEN;
  }

  /**
   * إرسال رسائل SMS جماعية
   * Send bulk SMS messages
   */
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<BeOnResponse> {
    try {
      console.log('📱 إرسال SMS جماعي:', { phoneCount: phoneNumbers.length, messageLength: message.length });

      const requestBody: SMSBulkRequest = {
        phoneNumbers,
        message
      };

      // تسجيل مفصل للطلب
      console.log('📱 تفاصيل الطلب:', {
        url: `${this.baseUrl}${BEON_V3_CONFIG.ENDPOINTS.SMS_BULK}`,
        headers: createBeOnHeaders(this.token),
        body: requestBody
      });

      const response = await fetch(`${this.baseUrl}${BEON_V3_CONFIG.ENDPOINTS.SMS_BULK}`, {
        method: 'POST',
        headers: createBeOnHeaders(this.token),
        body: JSON.stringify(requestBody)
      });

      console.log('📱 استجابة SMS جماعي:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // تسجيل مفصل للاستجابة
        console.log('📱 استجابة ناجحة:', {
          status: response.status,
          statusText: response.statusText,
          responseData: responseData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        return {
          success: true,
          message: 'تم إرسال الرسائل النصية بنجاح',
          data: {
            phoneCount: phoneNumbers.length,
            status: response.status,
            response: responseData,
            timestamp: new Date().toISOString(),
            requestDetails: {
              url: `${this.baseUrl}${BEON_V3_CONFIG.ENDPOINTS.SMS_BULK}`,
              body: requestBody
            }
          }
        };
      } else {
        // معالجة محسنة للأخطاء حسب الوثائق
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        // معالجة Rate Limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          return {
            success: false,
            error: 'تم تجاوز حد الطلبات المسموح',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: retryAfter ? parseInt(retryAfter) : 60,
            data: errorData
          };
        }

        // معالجة أخطاء المصادقة
        if (response.status === 401) {
          return {
            success: false,
            error: 'خطأ في المصادقة - تحقق من التوكن',
            code: 'AUTHENTICATION_ERROR',
            data: errorData
          };
        }

        // معالجة أخطاء عامة
        console.error('❌ خطأ في SMS جماعي:', errorData);
        return {
          success: false,
          error: `فشل في إرسال الرسائل النصية: ${response.status} ${response.statusText}`,
          code: `HTTP_${response.status}`,
          data: errorData
        };
      }
    } catch (error) {
      console.error('❌ خطأ في خدمة SMS:', error);
      return {
        success: false,
        error: 'حدث خطأ في إرسال الرسائل النصية',
        data: error
      };
    }
  }

  /**
   * إرسال رسالة SMS واحدة
   * Send single SMS message
   */
  async sendSingleSMS(phoneNumber: string, message: string): Promise<BeOnResponse> {
    return this.sendBulkSMS([phoneNumber], message);
  }

  /**
   * إرسال رسالة SMS باستخدام قالب
   * Send SMS using template
   */
  async sendTemplateSMS(templateId: number, phoneNumber: string, name: string, vars: string[]): Promise<BeOnResponse> {
    try {
      console.log('📱 إرسال SMS بالقالب:', { templateId, phoneNumber, name, vars });

      const requestBody = {
        template_id: templateId,
        phoneNumber,
        name,
        vars
      };

      const response = await fetch(`${this.baseUrl}${BEON_V3_CONFIG.ENDPOINTS.SMS_TEMPLATE}`, {
        method: 'POST',
        headers: createBeOnHeaders(this.token),
        body: JSON.stringify(requestBody)
      });

      console.log('📱 استجابة SMS بالقالب:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        return {
          success: true,
          message: 'تم إرسال الرسالة النصية بالقالب بنجاح',
          data: {
            templateId,
            phoneNumber,
            status: response.status
          }
        };
      } else {
        const errorText = await response.text();
        console.error('❌ خطأ في SMS بالقالب:', errorText);
        return {
          success: false,
          error: `فشل في إرسال الرسالة النصية بالقالب: ${response.status} ${response.statusText}`,
          data: errorText
        };
      }
    } catch (error) {
      console.error('❌ خطأ في خدمة SMS بالقالب:', error);
      return {
        success: false,
        error: 'حدث خطأ في إرسال الرسالة النصية بالقالب',
        data: error
      };
    }
  }

  /**
   * توليد رمز OTP
   * Generate OTP code
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * إرسال OTP عادي
   * Send plain OTP
   */
  async sendOTPPlain(phoneNumber: string, otp: string, name: string): Promise<BeOnResponse> {
    const message = `مرحباً ${name}، رمز التحقق الخاص بك هو: ${otp}. لا تشارك هذا الرمز مع أي شخص.`;
    return this.sendSingleSMS(phoneNumber, message);
  }

  /**
   * إرسال OTP جديد
   * Send new OTP
   */
  async sendOTPNew(phoneNumber: string, name: string, length: number = 6, language: string = 'ar', customOTP?: string): Promise<BeOnResponse> {
    const otp = customOTP || this.generateOTP();
    return this.sendOTPPlain(phoneNumber, otp, name);
  }

  /**
   * تنسيق رقم الهاتف
   * Format phone number
   */
  formatPhoneNumber(phone: string): string {
    // إزالة كل الأحرف غير الرقمية ما عدا +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // إذا لم يبدأ بـ +، نحاول تحديد كود الدولة
    if (!cleaned.startsWith('+')) {
      // إذا كان يبدأ بـ 20 (مصر)
      if (cleaned.startsWith('20')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 966 (السعودية)
      else if (cleaned.startsWith('966')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 971 (الإمارات)
      else if (cleaned.startsWith('971')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 974 (قطر)
      else if (cleaned.startsWith('974')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 965 (الكويت)
      else if (cleaned.startsWith('965')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 973 (البحرين)
      else if (cleaned.startsWith('973')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 968 (عمان)
      else if (cleaned.startsWith('968')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 962 (الأردن)
      else if (cleaned.startsWith('962')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 961 (لبنان)
      else if (cleaned.startsWith('961')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 964 (العراق)
      else if (cleaned.startsWith('964')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 963 (سوريا)
      else if (cleaned.startsWith('963')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 212 (المغرب)
      else if (cleaned.startsWith('212')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 213 (الجزائر)
      else if (cleaned.startsWith('213')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 216 (تونس)
      else if (cleaned.startsWith('216')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 218 (ليبيا)
      else if (cleaned.startsWith('218')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 249 (السودان)
      else if (cleaned.startsWith('249')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 221 (السنغال)
      else if (cleaned.startsWith('221')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 225 (ساحل العاج)
      else if (cleaned.startsWith('225')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 253 (جيبوتي)
      else if (cleaned.startsWith('253')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 34 (إسبانيا)
      else if (cleaned.startsWith('34')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 33 (فرنسا)
      else if (cleaned.startsWith('33')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 44 (إنجلترا)
      else if (cleaned.startsWith('44')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 351 (البرتغال)
      else if (cleaned.startsWith('351')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 39 (إيطاليا)
      else if (cleaned.startsWith('39')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 30 (اليونان)
      else if (cleaned.startsWith('30')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 357 (قبرص)
      else if (cleaned.startsWith('357')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 90 (تركيا)
      else if (cleaned.startsWith('90')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 66 (تايلاند)
      else if (cleaned.startsWith('66')) {
        cleaned = '+' + cleaned;
      }
      // إذا كان يبدأ بـ 0 (رقم محلي)
      else if (cleaned.startsWith('0')) {
        // نحاول تخمين كود الدولة حسب طول الرقم
        const withoutZero = cleaned.substring(1);
        if (withoutZero.length === 10) {
          // رقم مصري محتمل
          cleaned = '+20' + withoutZero;
        } else if (withoutZero.length === 9) {
          // رقم سعودي محتمل
          cleaned = '+966' + withoutZero;
      } else {
          // افتراضي: رقم سعودي
          cleaned = '+966' + withoutZero;
        }
      }
      // إذا لم يكن هناك كود دولة معروف، نضيف 966 كافتراضي
      else {
        cleaned = '+966' + cleaned;
      }
    }
    
    return cleaned;
  }

  /**
   * التحقق من صحة رقم الهاتف
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    // التحقق من الأرقام السعودية: +966 + 9 أرقام
    const saudiPhoneRegex = /^\+966[0-9]{9}$/;
    if (saudiPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام المصرية: +20 + 10 أرقام
    const egyptianPhoneRegex = /^\+20[0-9]{10}$/;
    if (egyptianPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الإماراتية: +971 + 9 أرقام
    const uaePhoneRegex = /^\+971[0-9]{9}$/;
    if (uaePhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام القطرية: +974 + 8 أرقام
    const qatarPhoneRegex = /^\+974[0-9]{8}$/;
    if (qatarPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الكويتية: +965 + 8 أرقام
    const kuwaitPhoneRegex = /^\+965[0-9]{8}$/;
    if (kuwaitPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام البحرينية: +973 + 8 أرقام
    const bahrainPhoneRegex = /^\+973[0-9]{8}$/;
    if (bahrainPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام العمانية: +968 + 8 أرقام
    const omanPhoneRegex = /^\+968[0-9]{8}$/;
    if (omanPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الأردنية: +962 + 9 أرقام
    const jordanPhoneRegex = /^\+962[0-9]{9}$/;
    if (jordanPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام اللبنانية: +961 + 8 أرقام
    const lebanonPhoneRegex = /^\+961[0-9]{8}$/;
    if (lebanonPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام العراقية: +964 + 10 أرقام
    const iraqPhoneRegex = /^\+964[0-9]{10}$/;
    if (iraqPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام السورية: +963 + 9 أرقام
    const syriaPhoneRegex = /^\+963[0-9]{9}$/;
    if (syriaPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام المغربية: +212 + 9 أرقام
    const moroccoPhoneRegex = /^\+212[0-9]{9}$/;
    if (moroccoPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الجزائرية: +213 + 9 أرقام
    const algeriaPhoneRegex = /^\+213[0-9]{9}$/;
    if (algeriaPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام التونسية: +216 + 8 أرقام
    const tunisiaPhoneRegex = /^\+216[0-9]{8}$/;
    if (tunisiaPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الليبية: +218 + 9 أرقام
    const libyaPhoneRegex = /^\+218[0-9]{9}$/;
    if (libyaPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام السودانية: +249 + 9 أرقام
    const sudanPhoneRegex = /^\+249[0-9]{9}$/;
    if (sudanPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام السنغالية: +221 + 9 أرقام
    const senegalPhoneRegex = /^\+221[0-9]{9}$/;
    if (senegalPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الساحل العاج: +225 + 8 أرقام
    const ivoryCoastPhoneRegex = /^\+225[0-9]{8}$/;
    if (ivoryCoastPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الجيبوتية: +253 + 8 أرقام
    const djiboutiPhoneRegex = /^\+253[0-9]{8}$/;
    if (djiboutiPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الإسبانية: +34 + 9 أرقام
    const spainPhoneRegex = /^\+34[0-9]{9}$/;
    if (spainPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الفرنسية: +33 + 9 أرقام
    const francePhoneRegex = /^\+33[0-9]{9}$/;
    if (francePhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الإنجليزية: +44 + 10 أرقام
    const ukPhoneRegex = /^\+44[0-9]{10}$/;
    if (ukPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام البرتغالية: +351 + 9 أرقام
    const portugalPhoneRegex = /^\+351[0-9]{9}$/;
    if (portugalPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام الإيطالية: +39 + 10 أرقام
    const italyPhoneRegex = /^\+39[0-9]{10}$/;
    if (italyPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام اليونانية: +30 + 10 أرقام
    const greecePhoneRegex = /^\+30[0-9]{10}$/;
    if (greecePhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام القبرصية: +357 + 8 أرقام
    const cyprusPhoneRegex = /^\+357[0-9]{8}$/;
    if (cyprusPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام التركية: +90 + 10 أرقام
    const turkeyPhoneRegex = /^\+90[0-9]{10}$/;
    if (turkeyPhoneRegex.test(phone)) return true;
    
    // التحقق من الأرقام التايلندية: +66 + 9 أرقام
    const thailandPhoneRegex = /^\+66[0-9]{9}$/;
    if (thailandPhoneRegex.test(phone)) return true;
    
    return false;
  }
}

// Export singleton instance
export const beonSMSService = new BeOnSMSService();

// Default export for backward compatibility
export default beonSMSService;



