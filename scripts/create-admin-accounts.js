// Create Admin Accounts Script
// ============================

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// بيانات الموظفين الافتراضية
const DEFAULT_EMPLOYEES = [
  {
    name: 'المدير العام',
    email: 'admin@el7lm.com',
    phone: '+966501234567',
    role: 'admin',
    department: 'الإدارة العليا',
    password: 'Admin@2024!'
  },
  {
    name: 'أحمد محمد - محلل أداء الوسائط',
    email: 'media.analyst@el7lm.com',
    phone: '+966501234568',
    role: 'media_analyst',
    department: 'التحليلات والوسائط',
    password: 'Media@2024!'
  },
  {
    name: 'سارة أحمد - مدير الدعم الفني',
    email: 'support.manager@el7lm.com',
    phone: '+966501234569',
    role: 'support',
    department: 'الدعم الفني',
    password: 'Support@2024!'
  },
  {
    name: 'محمد علي - مدير التسويق',
    email: 'marketing.manager@el7lm.com',
    phone: '+966501234570',
    role: 'marketing_manager',
    department: 'التسويق',
    password: 'Marketing@2024!'
  },
  {
    name: 'فاطمة حسن - مدير خدمة العملاء',
    email: 'customer.service@el7lm.com',
    phone: '+966501234571',
    role: 'customer_service',
    department: 'خدمة العملاء',
    password: 'Customer@2024!'
  },
  {
    name: 'خالد عبدالله - مدير المالية',
    email: 'finance.manager@el7lm.com',
    phone: '+966501234572',
    role: 'finance',
    department: 'المالية والمحاسبة',
    password: 'Finance@2024!'
  },
  {
    name: 'نورا سالم - مشرف إدارة العملاء',
    email: 'customer.supervisor@el7lm.com',
    phone: '+966501234573',
    role: 'customer_supervisor',
    department: 'إدارة العملاء',
    password: 'Supervisor@2024!'
  },
  {
    name: 'عبدالرحمن محمد - مدير الموارد البشرية',
    email: 'hr.manager@el7lm.com',
    phone: '+966501234574',
    role: 'hr_manager',
    department: 'الموارد البشرية',
    password: 'HR@2024!'
  },
  {
    name: 'مريم أحمد - مدير الجودة',
    email: 'quality.manager@el7lm.com',
    phone: '+966501234575',
    role: 'quality_manager',
    department: 'إدارة الجودة',
    password: 'Quality@2024!'
  },
  {
    name: 'يوسف علي - مدير الامتثال',
    email: 'compliance.manager@el7lm.com',
    phone: '+966501234576',
    role: 'compliance_manager',
    department: 'إدارة الامتثال',
    password: 'Compliance@2024!'
  },
  {
    name: 'هند محمد - مدير التدريب',
    email: 'training.manager@el7lm.com',
    phone: '+966501234577',
    role: 'training_manager',
    department: 'إدارة التدريب',
    password: 'Training@2024!'
  },
  {
    name: 'عبدالله حسن - مدير الأصول',
    email: 'assets.manager@el7lm.com',
    phone: '+966501234578',
    role: 'assets_manager',
    department: 'إدارة الأصول',
    password: 'Assets@2024!'
  },
  {
    name: 'لينا أحمد - مدير المشاريع',
    email: 'projects.manager@el7lm.com',
    phone: '+966501234579',
    role: 'projects_manager',
    department: 'إدارة المشاريع',
    password: 'Projects@2024!'
  },
  {
    name: 'طارق محمد - مدير العلاقات العامة',
    email: 'pr.manager@el7lm.com',
    phone: '+966501234580',
    role: 'pr_manager',
    department: 'العلاقات العامة',
    password: 'PR@2024!'
  },
  {
    name: 'ريم عبدالله - محرر محتوى',
    email: 'content.editor@el7lm.com',
    phone: '+966501234581',
    role: 'content',
    department: 'إدارة المحتوى',
    password: 'Content@2024!'
  },
  {
    name: 'سعد محمد - مندوب مبيعات',
    email: 'sales.rep@el7lm.com',
    phone: '+966501234582',
    role: 'sales',
    department: 'المبيعات',
    password: 'Sales@2024!'
  }
];

// صلاحيات الأدوار
const ROLE_PERMISSIONS = {
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
  },
  customer_supervisor: {
    canViewUsers: true, canEditUsers: true, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: true, canViewEmployees: true, canManageRoles: false,
    canViewSupport: true, canManageSupport: true, canAssignTickets: true,
    canManageCustomers: true, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: true,
    canExportData: true, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  hr_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: true, canViewEmployees: true, canManageRoles: true,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: false,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: true, canImportData: true, canViewAuditLogs: false,
    canManageHR: true, canViewEmployeeSalaries: true, canManageTraining: true,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  quality_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: true, canManageRoles: false,
    canViewSupport: true, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: true, canManageNotifications: false,
    canExportData: true, canImportData: false, canViewAuditLogs: true,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: true, canManageCompliance: true,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  compliance_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: true, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: true, canImportData: false, canViewAuditLogs: true,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: true,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  training_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: true, canManageAds: false, canManageVideos: true, canManageDreamAcademy: true,
    canManageEmployees: false, canViewEmployees: true, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: false,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: true,
    canExportData: true, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: true,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: true,
    allowedLocations: []
  },
  assets_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: false,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: true, canImportData: true, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: true, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  projects_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: true, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: false,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: true,
    canExportData: true, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: true,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  },
  pr_manager: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: true,
    canManageContent: true, canManageAds: true, canManageVideos: true, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: false,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: true,
    canExportData: true, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: true, canManageTournaments: false, canManageMedia: true,
    allowedLocations: []
  },
  content: {
    canViewUsers: false, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: false, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: false,
    canManageContent: true, canManageAds: true, canManageVideos: true, canManageDreamAcademy: true,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: false, canViewCustomerData: false,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: false, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: true,
    allowedLocations: []
  },
  sales: {
    canViewUsers: true, canEditUsers: false, canDeleteUsers: false,
    canViewFinancials: true, canManagePayments: false, canManageInvoices: false, canManageSubscriptions: false,
    canViewReports: true, canViewAnalytics: true, canGenerateReports: false,
    canManageContent: false, canManageAds: false, canManageVideos: false, canManageDreamAcademy: false,
    canManageEmployees: false, canViewEmployees: false, canManageRoles: false,
    canViewSupport: false, canManageSupport: false, canAssignTickets: false,
    canManageCustomers: true, canViewCustomerData: true,
    canManageSettings: false, canViewSystemHealth: false, canManageNotifications: false,
    canExportData: false, canImportData: false, canViewAuditLogs: false,
    canManageHR: false, canViewEmployeeSalaries: false, canManageTraining: false,
    canManageQuality: false, canManageCompliance: false,
    canManageAssets: false, canManageProjects: false,
    canManagePR: false, canManageTournaments: false, canManageMedia: false,
    allowedLocations: []
  }
};

// دالة لإنشاء حساب موظف
async function createEmployeeAccount(employee) {
  try {
    console.log(`\n🔧 إنشاء حساب: ${employee.name} (${employee.email})`);
    
    // إنشاء حساب في Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, employee.email, employee.password);
    const user = userCredential.user;
    
    console.log(`✅ تم إنشاء حساب المصادقة: ${user.uid}`);
    
    // إضافة بيانات الموظف في Firestore
    const employeeData = {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      permissions: ROLE_PERMISSIONS[employee.role],
      isActive: true,
      locations: [{
        countryId: 'SA',
        countryName: 'السعودية',
        cityId: 'riyadh',
        cityName: 'الرياض'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // إضافة في مجموعة employees
    const employeeRef = await addDoc(collection(db, 'employees'), employeeData);
    console.log(`✅ تم إضافة بيانات الموظف: ${employeeRef.id}`);
    
    // إضافة في مجموعة users
    const userData = {
      uid: user.uid,
      email: employee.email,
      name: employee.name,
      accountType: 'admin',
      role: employee.role,
      department: employee.department,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log(`✅ تم إضافة بيانات المستخدم: ${user.uid}`);
    
    return { success: true, userId: user.uid, employeeId: employeeRef.id };
    
  } catch (error) {
    console.error(`❌ خطأ في إنشاء حساب ${employee.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// دالة رئيسية لإنشاء جميع الحسابات
async function createAllAccounts() {
  console.log('🚀 بدء إنشاء حسابات الموظفين...\n');
  
  const results = [];
  
  for (const employee of DEFAULT_EMPLOYEES) {
    const result = await createEmployeeAccount(employee);
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
if (require.main === module) {
  createAllAccounts().catch(console.error);
}

module.exports = { createAllAccounts, createEmployeeAccount };




