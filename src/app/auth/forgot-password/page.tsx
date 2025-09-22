'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, ArrowLeft, Globe } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [phoneExistsError, setPhoneExistsError] = useState('');
  
  // Form data
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('+20'); // Default to Egypt

  // Countries list - متطابقة مع صفحة التسجيل
  const countries = [
    { name: 'السعودية', code: '+966', currency: 'SAR', currencySymbol: 'ر.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'الإمارات', code: '+971', currency: 'AED', currencySymbol: 'د.إ', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'الكويت', code: '+965', currency: 'KWD', currencySymbol: 'د.ك', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'قطر', code: '+974', currency: 'QAR', currencySymbol: 'ر.ق', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'البحرين', code: '+973', currency: 'BHD', currencySymbol: 'د.ب', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'عمان', code: '+968', currency: 'OMR', currencySymbol: 'ر.ع', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'مصر', code: '+20', currency: 'EGP', currencySymbol: 'ج.م', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'الأردن', code: '+962', currency: 'JOD', currencySymbol: 'د.أ', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'لبنان', code: '+961', currency: 'LBP', currencySymbol: 'ل.ل', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'العراق', code: '+964', currency: 'IQD', currencySymbol: 'د.ع', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'سوريا', code: '+963', currency: 'SYP', currencySymbol: 'ل.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'المغرب', code: '+212', currency: 'MAD', currencySymbol: 'د.م', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'الجزائر', code: '+213', currency: 'DZD', currencySymbol: 'د.ج', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'تونس', code: '+216', currency: 'TND', currencySymbol: 'د.ت', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'ليبيا', code: '+218', currency: 'LYD', currencySymbol: 'د.ل', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'اليمن', code: '+967', currency: 'YER', currencySymbol: 'ر.ي', phoneLength: 9, phonePattern: '[0-9]{9}' },
    // مضافة حديثاً
    { name: 'السودان', code: '+249', currency: 'SDG', currencySymbol: 'ج.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'السنغال', code: '+221', currency: 'XOF', currencySymbol: 'Fr', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'ساحل العاج', code: '+225', currency: 'XOF', currencySymbol: 'Fr', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'جيبوتي', code: '+253', currency: 'DJF', currencySymbol: 'Fr', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'إسبانيا', code: '+34', currency: 'EUR', currencySymbol: '€', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'فرنسا', code: '+33', currency: 'EUR', currencySymbol: '€', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'إنجلترا', code: '+44', currency: 'GBP', currencySymbol: '£', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'البرتغال', code: '+351', currency: 'EUR', currencySymbol: '€', phoneLength: 9, phonePattern: '[0-9]{9}' },
    { name: 'إيطاليا', code: '+39', currency: 'EUR', currencySymbol: '€', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'اليونان', code: '+30', currency: 'EUR', currencySymbol: '€', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'قبرص', code: '+357', currency: 'EUR', currencySymbol: '€', phoneLength: 8, phonePattern: '[0-9]{8}' },
    { name: 'تركيا', code: '+90', currency: 'TRY', currencySymbol: '₺', phoneLength: 10, phonePattern: '[0-9]{10}' },
    { name: 'تايلاند', code: '+66', currency: 'THB', currencySymbol: '฿', phoneLength: 9, phonePattern: '[0-9]{9}' },
  ];

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  // Check if phone number exists in database
  const checkPhoneExists = async (phoneNumber: string) => {
    setPhoneCheckLoading(true);
    setPhoneExistsError('');

    try {
      console.log('🔍 Checking phone number:', phoneNumber);
      
      const response = await fetch('/api/auth/check-user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          phone: phoneNumber
        })
      });

      const data = await response.json();
      console.log('📱 API Response:', data);
      
      if (data.phoneExists) {
        setPhoneExistsError('');
        return true;
      } else {
        setPhoneExistsError('هذا الرقم غير مسجل في قاعدة البيانات');
        return false;
      }
    } catch (err) {
      console.error('❌ Error checking phone:', err);
      setPhoneExistsError('حدث خطأ في التحقق من الرقم');
      return false;
      } finally {
        setPhoneCheckLoading(false);
    }
  };

  // Handle phone submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }

    // Check phone length according to country
    if (selectedCountryData && phone.length !== selectedCountryData.phoneLength) {
      setError(`رقم الهاتف يجب أن يكون ${selectedCountryData.phoneLength} أرقام لـ ${selectedCountryData.name}`);
      return;
    }

    const fullPhoneNumber = phone.startsWith('+') ? phone : `${selectedCountryData?.code}${phone}`;
    
    // First check if phone exists in database
    const phoneExists = await checkPhoneExists(fullPhoneNumber);
    if (!phoneExists) {
      return; // Error message already set in checkPhoneExists
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          name: 'المستخدم'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('تم إرسال رمز التحقق');
        setStep('otp');
      } else {
        setError(data.error || 'فشل في إرسال رمز التحقق');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('يرجى إدخال رمز التحقق الصحيح');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone.startsWith('+') ? phone : `${selectedCountryData?.code}${phone}`,
          otpCode: otp
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('تم التحقق من الرمز بنجاح');
        setStep('password');
      } else {
        setError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch (err) {
      setError('حدث خطأ في التحقق');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone.startsWith('+') ? phone : `${selectedCountryData?.code}${phone}`,
          newPassword: newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('تم تغيير كلمة المرور بنجاح');
        // حفظ كلمة المرور الجديدة في localStorage للاستخدام في تسجيل الدخول
        localStorage.setItem('newPassword', newPassword);
        localStorage.setItem('resetPhone', phone.startsWith('+') ? phone : `${selectedCountryData?.code}${phone}`);
        localStorage.setItem('resetEmail', data.user?.email || 'user_20_201017799580_1755026927645_o58h37@el7hm.com');
        localStorage.setItem('passwordChanged', 'true');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(data.error || 'فشل في تغيير كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="العودة"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="العودة إلى تسجيل الدخول"
            >
              تسجيل الدخول
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">استعادة كلمة المرور</h1>
          <p className="text-gray-600 mt-2">
            {step === 'phone' && 'أدخل رقم هاتفك لإرسال رمز التحقق'}
            {step === 'otp' && 'أدخل رمز التحقق المرسل إليك'}
            {step === 'password' && 'أدخل كلمة المرور الجديدة'}
          </p>
            </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {['phone', 'otp', 'password'].map((s, index) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  step === s || (step === 'otp' && s === 'phone') || (step === 'password')
                    ? 'bg-purple-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
              </div>

        {/* Error/Success messages */}
              {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
                  </div>
        )}
        
        {phoneExistsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {phoneExistsError}
                </div>
              )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
                </div>
              )}

        {/* Step 1: Phone */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدولة
              </label>
              <div className="relative">
                <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  title="اختر الدولة"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
                <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {selectedCountryData?.code}
                </div>
                  <input
                    type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={selectedCountryData ? '0'.repeat(selectedCountryData.phoneLength) : '1012345678'}
                  maxLength={selectedCountryData?.phoneLength}
                  className="w-full pr-10 pl-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    title={`أدخل رقم الهاتف بدون كود الدولة (${selectedCountryData?.phoneLength} أرقام)`}
                />
                  </div>
                {/* تلميحات رقم الهاتف */}
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">مثال على رقم الهاتف:</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>{selectedCountryData?.name}:</strong> {selectedCountryData?.code} + {selectedCountryData ? '0'.repeat(selectedCountryData.phoneLength) : '1012345678'}</p>
                    <p className="text-gray-600">• أدخل الرقم بدون كود الدولة</p>
                    <p className="text-gray-600">• يجب أن يكون الرقم مسجلاً في النظام</p>
                    <p className="text-gray-600">• سيتم إرسال رمز التحقق عبر SMS</p>
                  </div>
                </div>
                </div>
            
            <button
              type="submit"
              disabled={loading || phoneCheckLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري الإرسال...' : phoneCheckLoading ? 'جاري التحقق من الرقم...' : 'إرسال رمز التحقق'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors text-sm"
            >
              العودة إلى تسجيل الدخول
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز التحقق
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
              </div>

              <button
                type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </button>

                <button
                  type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
              تغيير رقم الهاتف
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors text-sm"
                >
                  العودة إلى تسجيل الدخول
                </button>
            </form>
          )}

        {/* Step 3: New Password */}
          {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  title="كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع أحرف كبيرة وصغيرة وأرقام"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* تلميحات كلمة المرور */}
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">متطلبات كلمة المرور:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    8 أحرف على الأقل
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    حرف كبير واحد على الأقل (A-Z)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    حرف صغير واحد على الأقل (a-z)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    رقم واحد على الأقل (0-9)
                  </li>
                </ul>
              </div>
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة المرور"
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors text-sm"
            >
              العودة إلى تسجيل الدخول
            </button>
            </form>
          )}
        </div>
      </div>
  );
}