// Simple Account Creation Script
// =============================

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "hagzzgo-87884",
  private_key_id: "3448c010-87b1-41e7-9771-cac444268cfb",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@hagzzgo-87884.iam.gserviceaccount.com",
  client_id: "865241332465",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40hagzzgo-87884.iam.gserviceaccount.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'hagzzgo-87884'
  });
}

const auth = admin.auth();
const db = admin.firestore();

// بيانات الموظفين
const employees = [
  {
    name: 'المدير العام',
    email: 'admin@el7lm.com',
    password: 'Admin@2024!',
    role: 'admin',
    department: 'الإدارة العليا',
    phone: '+966501234567'
  },
  {
    name: 'أحمد محمد - محلل أداء الوسائط',
    email: 'media.analyst@el7lm.com',
    password: 'Media@2024!',
    role: 'media_analyst',
    department: 'التحليلات والوسائط',
    phone: '+966501234568'
  },
  {
    name: 'سارة أحمد - مدير الدعم الفني',
    email: 'support.manager@el7lm.com',
    password: 'Support@2024!',
    role: 'support',
    department: 'الدعم الفني',
    phone: '+966501234569'
  },
  {
    name: 'محمد علي - مدير التسويق',
    email: 'marketing.manager@el7lm.com',
    password: 'Marketing@2024!',
    role: 'marketing_manager',
    department: 'التسويق',
    phone: '+966501234570'
  },
  {
    name: 'فاطمة حسن - مدير خدمة العملاء',
    email: 'customer.service@el7lm.com',
    password: 'Customer@2024!',
    role: 'customer_service',
    department: 'خدمة العملاء',
    phone: '+966501234571'
  },
  {
    name: 'خالد عبدالله - مدير المالية',
    email: 'finance.manager@el7lm.com',
    password: 'Finance@2024!',
    role: 'finance',
    department: 'المالية والمحاسبة',
    phone: '+966501234572'
  }
];

// صلاحيات الأدوار
const permissions = {
  admin: {
    canViewUsers: true, canEditUsers: true, canDeleteUsers: true,
    canViewFinancials: true, canManagePayments: true, canManageInvoices: true, canManageSubscriptions: true,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: true, canManageAds: true, canManageVideos: true, canManageDreamAcademy: true,
    canManageEmployees: true, canViewEmployees: true, canManageRoles: true,
    canViewSupport: true, canManageSupport: true, canAssignTickets: true,
    canManageCustomers: true, canViewCustomerData: true,
    canManageSettings: true, canViewSystemHealth: true, canManageNotifications: true,
    canExportData: true, canImportData: true, canViewAuditLogs: true,
    canManageHR: true, canViewEmployeeSalaries: true, canManageTraining: true,
    canManageQuality: true, canManageCompliance: true,
    canManageAssets: true, canManageProjects: true,
    canManagePR: true, canManageTournaments: true, canManageMedia: true,
    allowedLocations: []
  },
  media_analyst: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: true, canManageAds: true, canManageVideos: true, canManageDreamAcademy: true,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: true, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: true,
    allowedLocations: []
  },
  support: {
    canViewUsers: true, canEditUsers: true, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: false, canGenerateReports: false,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: true, canManageSupport: true, canAssignTickets: true,
    canManageCustomers: true, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: true, canManageNotifications: false,
    canExportData: false, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  marketing_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: true, canManageAds: true, canManageVideos: true, canManageDreamAcademy: true,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: true,
    canExportData: true, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: true, canManageTournaments: false, canManageMedia: true,
    allowedLocations: []
  },
  customer_service: {
    canViewUsers: true, canEditUsers: true, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: false, canGenerateReports: false,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: true, canManageSupport: true, canAssignTickets: false,
    canManageCustomers: true, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: true,
    canExportData: false, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  finance: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: true, canManageInvoices: true, canManageSubscriptions: true,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: true, canImportData: true, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: true, canManageTraining: false,
    canManageQuality: false, canManageCompliance: true,
    canManageAssets: true, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  }
};

async function createAccount(employee) {
  try {
    console.log(`\n🔧 إنشاء حساب: ${employee.name} (${employee.email})`);
    
    // إنشاء حساب في Authentication
    const userRecord = await auth.createUser({
      email: employee.email,
      password: employee.password,
      displayName: employee.name
    });
    
    console.log(`✅ تم إنشاء حساب المصادقة: ${userRecord.uid}`);
    
    // إضافة بيانات الموظف في Firestore
    const employeeData = {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      permissions: permissions[employee.role],
      isActive: true,
      locations: [{
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const employeeRef = await db.collection('employees').add(employeeData);
    console.log(`✅ تم إضافة بيانات الموظف: ${employeeRef.id}`);
    
    // إضافة بيانات المستخدم
    const userData = {
      uid: userRecord.uid,
      email: employee.email,
      name: employee.name,
      accountType: 'admin',
      role: employee.role,
      department: employee.department,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log(`✅ تم إضافة بيانات المستخدم: ${userRecord.uid}`);
    
    return { success: true, userId: userRecord.uid, employeeId: employeeRef.id };
    
  } catch (error) {
    console.error(`❌ خطأ في إنشاء حساب ${employee.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createAllAccounts() {
  console.log('🚀 بدء إنشاء حسابات الموظفين...\n');
  
  const results = [];
  
  for (const employee of employees) {
    const result = await createAccount(employee);
    results.push({
      email: employee.email,
      name: employee.name,
      ...result
    });
    
    // انتظار قصير بين الحسابات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 ملخص النتائج:');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ نجح: ${successful.length} حساب`);
  console.log(`❌ فشل: ${failed.length} حساب`);
  
  if (failed.length > 0) {
    console.log('\n❌ الحسابات الفاشلة:');
    failed.forEach(f => {
      console.log(`- ${f.name} (${f.email}): ${f.error}`);
    });
  }
  
  console.log('\n✅ تم الانتهاء من إنشاء الحسابات!');
}

// تشغيل السكريبت
createAllAccounts().catch(console.error);




