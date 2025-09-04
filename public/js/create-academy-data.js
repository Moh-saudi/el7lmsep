// أداة إنشاء بيانات الأكاديمية في Firestore
// قم بفتح هذا الملف في المتصفح وستجد الكود في Console

console.log('🚀 أداة إنشاء بيانات الأكاديمية');
console.log('📋 انسخ هذا الكود وشغله في Console في صفحة الأكاديمية:');

const createAcademyDataCode = `
// إنشاء بيانات اختبار للأكاديمية
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';

const createAcademyData = async () => {
  const { user } = useAuth();
  if (!user) {
    console.error('❌ المستخدم غير مسجل دخول');
    return;
  }

  const academyData = {
    // البيانات الأساسية
    name: 'أكاديمية النجوم الرياضية',
    email: user.email || 'academy@example.com',
    phone: '+966501234567',
    website: 'https://stars-academy.com',
    logo: '/images/club-avatar.png', // الصورة الافتراضية
    
    // الموقع
    location: {
      country: 'السعودية',
      city: 'الرياض',
      address: 'حي النرجس، شارع الأمير محمد بن سلمان',
      coordinates: {
        lat: 24.7136,
        lng: 46.6753
      }
    },
    
    // معلومات الأكاديمية
    establishedYear: 2015,
    description: 'أكاديمية رياضية متخصصة في تدريب الشباب وتطوير المواهب الكروية',
    vision: 'إعداد جيل من اللاعبين المحترفين والمتميزين',
    mission: 'تقديم برامج تدريبية عالية الجودة وتطوير المهارات الفنية والبدنية',
    
    // الإحصائيات
    stats: {
      totalPlayers: 150,
      activePlayers: 120,
      graduatedPlayers: 45,
      championships: 12,
      yearsExperience: 9,
      successRate: 85
    },
    
    // البرامج والخدمات
    programs: [
      'برنامج الناشئين (8-12 سنة)',
      'برنامج الشباب (13-17 سنة)',
      'برنامج الكبار (18+ سنة)',
      'برنامج حراس المرمى',
      'التدريب الصيفي المكثف'
    ],
    
    facilities: [
      'ملعب عشب طبيعي',
      'ملعب عشب صناعي',
      'صالة لياقة بدنية',
      'غرف تبديل الملابس',
      'عيادة طبية',
      'كافتيريا'
    ],
    
    // الشهادات والجوائز
    certifications: [
      'شهادة اعتماد من الاتحاد السعودي',
      'شهادة معايير الجودة الرياضية',
      'عضوية في رابطة الأكاديميات العربية'
    ],
    
    achievements: [
      'جائزة أفضل أكاديمية 2023',
      'المركز الأول في بطولة الأكاديميات',
      'تخريج 15 لاعب محترف'
    ],
    
    // معلومات إضافية
    socialMedia: {
      instagram: '@stars_academy',
      twitter: '@StarsAcademy',
      facebook: 'StarsAcademySA',
      youtube: 'StarsAcademyOfficial'
    },
    
    // الإعدادات
    isVerified: true,
    isPremium: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    await setDoc(doc(db, 'academies', user.uid), academyData);
    console.log('✅ تم إنشاء بيانات الأكاديمية بنجاح!');
    console.log('📊 البيانات المحفوظة:', academyData);
    
    // إعادة تحميل الصفحة لإظهار البيانات الجديدة
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('❌ خطأ في حفظ البيانات:', error);
  }
};

// تشغيل الدالة
createAcademyData();
`;

console.log(createAcademyDataCode);
console.log('📌 بعد نسخ الكود، اذهب إلى صفحة الأكاديمية وشغل الكود في Console'); 
