'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
// import { secureConsole } from '@/lib/utils/secure-console';
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    Phone,
    Shield,
    User,
    Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
// import EmailVerification from '@/components/auth/EmailVerification';
// import { EmailService } from '@/lib/emailjs/service';
import { getInvalidAccountMessage, getContactInfo } from '@/lib/support-contact';
// تم حذف الترجمة
// import SMSOTPVerification from '@/components/shared/SMSOTPVerification';
// import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const { login, logout, user, userData, loading: authLoading } = useAuth();
  const t = (key: string) => key;
  const isRTL = true;
  const [isClient, setIsClient] = useState(false);

  // التأكد من أننا على العميل
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // إذا كان المستخدم مسجل دخوله مسبقاً، نخفي النموذج
  const shouldShowForm = !authLoading && !user;
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    rememberMe: false,
  });
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone'); // تغيير الافتراضي لرقم الهاتف
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const [showEmailVerification, setShowEmailVerification] = useState(false);
  // const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // قائمة الدول مع أكوادها والعملات وأطوال أرقام الهاتف
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

  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Saudi Arabia

  // عند تحميل الصفحة: تحقق من وجود بريد معلق في localStorage
  // useEffect(() => {
  //   const storedPendingEmail = localStorage.getItem('pendingEmailVerification');
  //   if (storedPendingEmail) {
  //     setPendingEmail(storedPendingEmail);
  //     setShowEmailVerification(true);
  //   }
  // }, []);

  // إيقاف التحميل إذا فشلت المصادقة أو انتهت
  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  // تحميل بيانات Remember Me عند بدء التطبيق
  useEffect(() => {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('userEmail');
    const savedPhone = localStorage.getItem('userPhone');
    
    if (rememberMe === 'true') {
      if (savedPhone) {
        setFormData(prev => ({
          ...prev,
          phone: savedPhone,
          rememberMe: true
        }));
        setLoginMethod('phone');
        console.log('📱 Auto-filled phone from Remember Me');
      } else if (savedEmail) {
        setFormData(prev => ({
          ...prev,
          email: savedEmail,
          rememberMe: true
        }));
        setLoginMethod('email');
        console.log('📧 Auto-filled email from Remember Me');
      }
    }
  }, []);

  // تحميل كلمة المرور الجديدة من استعادة كلمة المرور
  useEffect(() => {
    const newPassword = localStorage.getItem('newPassword');
    const resetPhone = localStorage.getItem('resetPhone');
    const resetEmail = localStorage.getItem('resetEmail');
    const passwordChanged = localStorage.getItem('passwordChanged');
    
    if (newPassword && resetPhone && resetEmail && passwordChanged === 'true') {
      setFormData(prev => ({
        ...prev,
        phone: resetPhone,
        email: resetEmail,
        password: newPassword
      }));
      setLoginMethod('email'); // استخدام البريد الإلكتروني للتسجيل
      setMessage('تم تحميل كلمة المرور الجديدة. ملاحظة: كلمة المرور لم تتغير فعلياً في Firebase، يرجى استخدام كلمة المرور الأصلية أو التواصل مع الدعم الفني.');
      
      // مسح البيانات من localStorage بعد الاستخدام
      localStorage.removeItem('newPassword');
      localStorage.removeItem('resetPhone');
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('passwordChanged');
      
      console.log('🔑 Auto-filled new password from reset');
    }
  }, []);

  const handleInputChange = (e: { target: { name: string; value: string; type: string; checked: boolean; }; }) => {
    const { name, value, type, checked } = e.target;
    
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getDashboardRoute = (accountType: string | undefined) => {
    // التحقق من وجود accountType
    if (!accountType) {
      console.error('Account type is undefined');
      return '/auth/login';
    }

    switch (accountType) {
      case 'player':
        return '/dashboard/player';
      case 'club':
        return '/dashboard/club';
      case 'agent':
        return '/dashboard/agent';
      case 'academy':
        return '/dashboard/academy';
      case 'trainer':
        return '/dashboard/trainer';
      case 'admin':
        return '/dashboard/admin';
      case 'marketer':
        return '/dashboard/marketer';
      case 'parent':
        return '/dashboard/player'; // توجيه أولياء الأمور للوحة اللاعبين
      default:
        console.error('Invalid account type:', accountType);
        return '/auth/login'; // إرجاع للتسجيل إذا كان النوع غير صالح
    }
  };

  // دالة للتعامل مع الحسابات المعطلة أو غير المحددة
  const handleInvalidAccount = (accountType: string | undefined) => {
    const errorMessage = `نوع الحساب غير صحيح: ${accountType || 'غير محدد'}`;
    console.error(errorMessage);
    setError(errorMessage);
    setLoading(false);
  };

  // دالة للبحث عن البريد الإلكتروني المؤقت باستخدام رقم الهاتف
  const findFirebaseEmailByPhone = async (phone: string): Promise<string | null> => {
    try {
      console.log('🔍 Searching for Firebase email with phone:', phone);
      
      // استخدام API route للبحث عن المستخدم
      const response = await fetch('/api/auth/find-user-by-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        console.log('✅ Found user with phone:', result.user);
        
        // إرجاع البريد الإلكتروني المستخدم في Firebase
        return result.user.email;
      }
      
      console.log('❌ No user found with phone:', phone);
      return null;
    } catch (error) {
      console.error('Error searching for Firebase email:', error);
      return null;
    }
  };

  // دالة دمج كود الدولة مع الرقم
  function normalizePhone(countryCode: string, phone: string) {
    let local = phone.replace(/^0+/, '');
    local = local.replace(/\D/g, '');
    
    // إضافة + إذا لم يكن موجوداً في كود الدولة
    const cleanCountryCode = countryCode.replace(/\D/g, '');
    const formattedPhone = `+${cleanCountryCode}${local}`;
    
    console.log('🔍 normalizePhone:', { countryCode, phone, cleanCountryCode, local, formattedPhone });
    return formattedPhone;
  }

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let loginEmail: string;
      
      if (loginMethod === 'email') {
        // التحقق من البريد الإلكتروني
        if (!formData.email.trim()) {
          console.error('يرجى إدخال البريد الإلكتروني');
          setError('يرجى إدخال البريد الإلكتروني');
          setLoading(false);
          return;
        }

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
          console.error('يرجى إدخال بريد إلكتروني صالح');
          setError('يرجى إدخال بريد إلكتروني صالح');
          setLoading(false);
          return;
        }
        
        loginEmail = formData.email.trim();
      } else {
        // التحقق من رقم الهاتف
        if (!formData.phone.trim()) {
          console.error('يرجى إدخال رقم الهاتف');
          setError('يرجى إدخال رقم الهاتف');
          setLoading(false);
          return;
        }

        // التحقق من صحة تنسيق رقم الهاتف حسب الدولة
        if (selectedCountry) {
          const phoneRegex = new RegExp(selectedCountry.phonePattern);
          if (!phoneRegex.test(formData.phone)) {
            const phoneError = `يرجى إدخال رقم هاتف صحيح مكون من ${selectedCountry.phoneLength} أرقام للدولة ${selectedCountry.name}`;
            console.error(phoneError);
            setError(phoneError);
            setLoading(false);
            return;
          }
        }

        // دمج كود الدولة مع الرقم
        const fullPhone = selectedCountry ? normalizePhone(selectedCountry.code, formData.phone) : formData.phone;
        console.log('🔍 Searching for user with phone:', fullPhone);
        
        const firebaseEmail = await findFirebaseEmailByPhone(fullPhone);
        if (!firebaseEmail) {
          const phoneNotFoundError = `رقم الهاتف غير مسجل في النظام. يرجى إنشاء حساب جديد أو التحقق من صحة الرقم.`;
          console.error(phoneNotFoundError);
          setError(phoneNotFoundError);
          setLoading(false);
          return;
        }
        loginEmail = firebaseEmail;
      }

      console.log('🔐 محاولة تسجيل الدخول...');
      console.log('جاري التحقق من البيانات...');
      
      // محاولة تسجيل الدخول مباشرة
      const result = await login(loginEmail, formData.password);
      
      console.log('✅ تم تسجيل الدخول بنجاح');
      console.log('تم تسجيل الدخول بنجاح!');
      
      // التحقق من وجود result
      if (!result) {
        console.error('فشل في تسجيل الدخول - لا توجد نتيجة');
        setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }
      
      // التحقق من وجود userData
      if (!result.userData) {
        console.error('فشل في تسجيل الدخول - لا توجد بيانات مستخدم');
        setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }
      
      // التحقق من وجود accountType
      if (!result.userData.accountType) {
        handleInvalidAccount(result.userData.accountType);
        return;
      }

      // التحقق من صحة نوع الحساب
      const validAccountTypes = ['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'];
      if (!validAccountTypes.includes(result.userData.accountType)) {
        handleInvalidAccount(result.userData.accountType);
        return;
      }
      
      // حفظ معلومات Remember Me إذا كان مطلوباً
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        if (loginMethod === 'email') {
          localStorage.setItem('userEmail', formData.email);
        } else {
          localStorage.setItem('userPhone', formData.phone);
        }
        localStorage.setItem('accountType', result.userData.accountType);
      }
      
      console.log('تم تسجيل الدخول بنجاح! جاري تحويلك...');
      
      // توجيه مباشر للوحة التحكم المناسبة
      const dashboardRoute = getDashboardRoute(result.userData.accountType);
      
      setTimeout(() => {
        router.replace(dashboardRoute);
      }, 1000);
      
    } catch (err: any) {
      console.error('فشل تسجيل الدخول:', err);
      console.log('Error code:', err.code); // للتأكد من نوع الخطأ
      
      // التحقق من نوع الخطأ
      if (err.code === 'auth/user-not-found') {
        const noAccountError = loginMethod === 'email' 
          ? `البريد الإلكتروني غير مسجل في النظام

الحلول المقترحة:
• تحقق من صحة البريد الإلكتروني المدخل
• قم بإنشاء حساب جديد إذا لم يكن لديك حساب
• تواصل مع الدعم الفني إذا كنت متأكداً من صحة البريد`
          : `رقم الهاتف غير مسجل في النظام

الحلول المقترحة:
• تحقق من صحة رقم الهاتف المدخل
• قم بإنشاء حساب جديد إذا لم يكن لديك حساب
• تواصل مع الدعم الفني إذا كنت متأكداً من صحة الرقم`;
        
        console.error(noAccountError);
        setError(noAccountError);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        const wrongPasswordError = `كلمة المرور غير صحيحة

الحلول المقترحة:
• تحقق من صحة كلمة المرور المدخلة
• تأكد من حالة الأحرف (كبيرة/صغيرة)
• استخدم "نسيت كلمة المرور" لإعادة تعيينها
• تأكد من عدم تفعيل Caps Lock`;
        
        console.log('Setting error:', wrongPasswordError); // للتأكد من تعيين الخطأ
        console.error(wrongPasswordError);
        setError(wrongPasswordError);
      } else if (err.code === 'auth/too-many-requests') {
        const tooManyRequestsError = `تم تجاوز عدد المحاولات المسموح بها

الحلول المقترحة:
• انتظر قليلاً قبل المحاولة مرة أخرى
• استخدم "نسيت كلمة المرور" لإعادة تعيينها
• تواصل مع الدعم الفني إذا استمرت المشكلة`;
        
        console.error(tooManyRequestsError);
        setError(tooManyRequestsError);
      } else if (err.code === 'auth/network-request-failed') {
        const networkError = `خطأ في الاتصال

الحلول المقترحة:
• تحقق من اتصالك بالإنترنت
• حاول إعادة تحميل الصفحة
• تأكد من استقرار الاتصال`;
        
        console.error(networkError);
        setError(networkError);
      } else if (err.code === 'auth/invalid-email') {
        const invalidEmailError = `صيغة البريد الإلكتروني غير صحيحة

الحلول المقترحة:
• تحقق من صحة البريد الإلكتروني المدخل
• تأكد من وجود @ و . في البريد
• مثال: user@example.com`;
        
        console.error(invalidEmailError);
        setError(invalidEmailError);
      } else {
        // أخطاء أخرى
        const genericError = `خطأ في تسجيل الدخول: ${err.message || 'حدث خطأ غير متوقع'}`;
        console.error(genericError);
        setError(genericError);
      }
      
      setMessage(''); 
      setLoading(false);
    }
  };

  // const handleEmailVerificationSuccess = () => {
  //   setShowEmailVerification(false);
  //   setPendingEmail(null);
  //   localStorage.removeItem('pendingEmailVerification');
  //   toast.success('✅ تم التحقق من البريد الإلكتروني بنجاح! سيتم تحويلك للوحة التحكم.', { duration: 3000 });
  //   setTimeout(() => {
  //     if (userData) {
  //       const dashboardRoute = getDashboardRoute(userData.accountType);
  //       router.replace(dashboardRoute);
  //     }
  //   }, 1000);
  // };

  // const handleEmailVerificationFailed = (error: string) => {
  //   setShowEmailVerification(false);
  //   setPendingEmail(null);
  //   localStorage.removeItem('pendingEmailVerification');
  //   const errorMessage = error || 'فشل التحقق من البريد الإلكتروني.';
  //   toast.error(errorMessage, { duration: 5000 });
  //   setError(errorMessage);
  // };

  // const handleEmailVerificationCancel = () => {
  //   setShowEmailVerification(false);
  //   setPendingEmail(null);
  //   localStorage.removeItem('pendingEmailVerification');
  //   toast.error('تم إلغاء التحقق من البريد الإلكتروني.', { duration: 3000 });
  //   setError('تم إلغاء التحقق من البريد الإلكتروني.');
  // };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find(c => c.code === e.target.value);
    if (country) setSelectedCountry(country);
  };

  // إذا كان المستخدم يحمل أو مسجل دخوله، نعرض شاشة تحميل
  if (authLoading || (user && !userData)) {
    return (
      <div
        className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-blue-600 to-purple-700"
        dir="rtl"
      >
        <div className="w-full max-w-xs overflow-hidden bg-white shadow-2xl rounded-xl">
          <div className="p-3 text-center text-white bg-gradient-to-r from-blue-600 to-purple-700">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8" />
            </div>
                            <h1 className="mb-1 text-xl font-bold">جاري التحقق...</h1>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600">
              {authLoading ? 'جاري التحميل...' : 'جاري تحميل بيانات المستخدم...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخوله مسبقاً، نعرض خيار الذهاب للوحة التحكم
  if (user && userData && !loading) {
    // التحقق من صحة نوع الحساب
    if (!userData.accountType || !['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'].includes(userData.accountType)) {
      return (
        <div
          className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-red-600 to-orange-700"
          dir="rtl"
        >
          <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-xl">
            <div className="p-3 text-center text-white bg-gradient-to-r from-red-600 to-orange-700">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="mb-1 text-xl font-bold">مشكلة تقنية</h1>
              <p className="text-xs text-red-100">حسابك يحتاج إلى إصلاح</p>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  {userData['name'] || userData['displayName'] || 'مستخدم'}
                </h2>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-right">
                  <p className="text-sm text-red-800 mb-3">
                    <strong>مشكلة في نوع الحساب:</strong> {userData.accountType || 'غير محدد'}
                  </p>
                  <p className="text-sm text-red-700 mb-4">
                    يرجى التواصل مع الدعم الفني لحل هذه المشكلة
                  </p>
                  <div className="space-y-2 text-sm text-red-600">
                    <p>📧 البريد الإلكتروني: {getContactInfo().email}</p>
                    <p>📱 الواتساب: {getContactInfo().whatsappQatar} أو {getContactInfo().whatsappEgypt}</p>
                    <p>🌐 نموذج الدعم: <a href={getContactInfo().contactForm} className="underline">اضغط هنا</a></p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => logout()}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  تسجيل الخروج
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const dashboardRoute = getDashboardRoute(userData.accountType);
    
    return (
      <div
        className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-green-600 to-blue-700"
        dir="rtl"
      >
        <div className="w-full max-w-xs overflow-hidden bg-white shadow-2xl rounded-xl">
          <div className="p-3 text-center text-white bg-gradient-to-r from-green-600 to-blue-700">
            <div className="flex justify-center mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="mb-1 text-xl font-bold">مرحباً بك!</h1>
            <p className="text-xs text-green-100">أنت مسجل دخولك بالفعل</p>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {userData['name'] || userData['displayName'] || 'مستخدم'}
              </h2>
              <p className="text-sm text-gray-600">
                نوع الحساب: {userData.accountType === 'player' && 'لاعب'}
                {userData.accountType === 'club' && 'نادي'}
                {userData.accountType === 'agent' && 'وكيل'}
                {userData.accountType === 'academy' && 'أكاديمية'}
                {userData.accountType === 'trainer' && 'مدرب'}
                {userData.accountType === 'admin' && 'مدير'}
                {userData.accountType === 'marketer' && 'مسوق'}
                {userData.accountType === 'parent' && 'ولي أمر'}
                {!userData.accountType && 'غير محدد'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(dashboardRoute)}
                className="w-full py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                الذهاب إلى لوحة التحكم
              </button>
              
              <button
                onClick={() => {
                  // تسجيل خروج والبقاء في صفحة الدخول
                  logout().then(() => {
                    console.log('تم تسجيل الخروج بنجاح');
                    setMessage('تم تسجيل الخروج بنجاح');
                    setError('');
                  }).catch((error) => {
                    console.error('خطأ في تسجيل الخروج:', error);
                    console.error('حدث خطأ أثناء تسجيل الخروج');
                    setError('حدث خطأ أثناء تسجيل الخروج');
                  });
                }}
                className="w-full py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isClient && isRTL ? 'dir-rtl' : 'dir-ltr'} min-h-screen w-full flex items-center justify-center bg-purple-950 px-4 py-8`}>
      {/* Centered compact card */}
      <div className="w-full max-w-md rounded-2xl border border-purple-100 shadow-2xl backdrop-blur bg-white/95">
        <div className="px-6 pt-6 pb-3">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2 items-center text-purple-600">
              <Shield className="w-6 h-6" />
              <span className="text-base font-bold">El7lm</span>
            </div>
            <button type="button" onClick={() => router.push('/auth/register')} className="text-xs text-gray-600 hover:text-indigo-600">ليس لديك حساب؟ إنشاء حساب</button>
          </div>
          <div className="mb-2 text-center">
            <h1 className="text-xl font-extrabold text-gray-900">تسجيل الدخول</h1>
            <p className="mt-1 text-xs text-gray-500">مرحباً بك مرة أخرى في منصة El7lm</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="px-6 pb-6 space-y-4"
          >
            <div className="space-y-4">
            {/* Error and Success Messages */}
            {error && (
                <div className="flex gap-2 items-start p-4 text-red-700 bg-red-50 rounded-lg" role="alert" aria-live="assertive">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="whitespace-pre-line">
                    {error}
                  </div>
                  <div className="flex gap-2 mt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => router.push('/auth/forgot-password')}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      نسيت كلمة المرور
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/auth/register')}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      إنشاء حساب جديد
                    </button>
                  </div>
                </div>
              </div>
            )}
            {message && (
              <div className="flex gap-2 items-center p-4 text-green-700 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <p>{message}</p>
              </div>
            )}

            {/* Login Method Toggle */}
            <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors ${
                  loginMethod === 'phone'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Phone className="w-3 h-3" />
                رقم الهاتف
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-3 h-3" />
                البريد الإلكتروني
              </button>
            </div>

            {/* Form Fields */}
            {loginMethod === 'phone' ? (
              <div className="space-y-3">
                {/* Country Selection */}
                <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">البلد</label>
                  <select
                    value={selectedCountry?.code || ''}
                    onChange={handleCountryChange}
                    className="py-2 pr-10 pl-4 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    title="اختر البلد"
                    aria-label="اختر البلد"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code}) - {country.phoneLength} أرقام
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Phone Input */}
                <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">رقم الهاتف</label>
                  <div className="relative">
                    <div className="flex">
                      <div className="flex items-center px-2 text-xs bg-gray-50 rounded-l-lg border border-r-0 border-gray-300">
                        {selectedCountry?.code || '+966'}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent border-gray-300 text-sm"
                        placeholder={selectedCountry ? `${selectedCountry.phoneLength} أرقام` : 'أدخل رقم الهاتف'}
                        pattern={selectedCountry?.phonePattern || '[0-9]{9}'}
                        maxLength={selectedCountry?.phoneLength || 9}
                        required
                        aria-label="رقم الهاتف"
                        title={`أدخل رقم الهاتف بدون كود الدولة (${selectedCountry?.phoneLength || 9} أرقام)`}
                      />
                      <Phone className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                    </div>
                  </div>
                  {/* تلميحات رقم الهاتف */}
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>مثال:</strong> {selectedCountry?.name} - {selectedCountry?.code} + {selectedCountry ? '0'.repeat(selectedCountry.phoneLength) : '1012345678'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">• أدخل الرقم بدون كود الدولة</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block mb-1.5 text-gray-700 text-sm">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="py-2 pr-10 pl-4 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1.5 text-gray-700 text-sm">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="py-2 pr-10 pl-10 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <Lock className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 rounded"
                  title="تذكرني"
                  aria-label="تذكرني"
                />
                <span className="text-sm text-gray-600">تذكرني</span>
              </div>
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                onClick={() => router.push('/auth/forgot-password')}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 justify-between items-center pt-1">
              <span />
              <button
                type="submit"
                disabled={loading || authLoading}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all ${loading || authLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {loading || authLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {authLoading ? 'جاري التحقق من البيانات...' : 'جاري تسجيل الدخول...'}
                    </span>
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>
          </form>

      {/* Email Verification Modal - DISABLED */}
        {/* {showEmailVerification && pendingEmail && (
          <EmailVerification
            email={pendingEmail}
            name={userData?.name || 'مستخدم'}
            onVerificationSuccess={handleEmailVerificationSuccess}
            onVerificationFailed={handleEmailVerificationFailed}
            onCancel={handleEmailVerificationCancel}
          />
        )} */}
        </div>
      </div>

      {/* Toast Notifications - Disabled temporarily */}
      {/* <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            direction: 'rtl',
            textAlign: 'right',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            maxWidth: '400px',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          // Success toast styling
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          // Error toast styling
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          // Loading toast styling
          loading: {
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          },
        }}
      /> */}
      </div>
  );
}
