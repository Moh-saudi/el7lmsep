// Employee Permissions Configuration
// =================================

import { RolePermissions, EmployeeRole } from '@/types/employees';

// الصلاحيات الافتراضية لكل دور
export const DEFAULT_PERMISSIONS: Record<EmployeeRole, RolePermissions> = {
  // مدير نظام عام - جميع الصلاحيات
  admin: {
    // صلاحيات المستخدمين
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    
    // صلاحيات المالية
    canViewFinancials: true,
    canManagePayments: true,
    canManageInvoices: true,
    canManageSubscriptions: true,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    
    // صلاحيات المحتوى
    canManageContent: true,
    canManageAds: true,
    canManageVideos: true,
    canManageDreamAcademy: true,
    
    // صلاحيات الموظفين
    canManageEmployees: true,
    canViewEmployees: true,
    canManageRoles: true,
    
    // صلاحيات الدعم الفني
    canViewSupport: true,
    canManageSupport: true,
    canAssignTickets: true,
    
    // صلاحيات العملاء
    canManageCustomers: true,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: true,
    canViewSystemHealth: true,
    canManageNotifications: true,
    
    // صلاحيات البيانات
    canExportData: true,
    canImportData: true,
    canViewAuditLogs: true,
    
    // صلاحيات الموارد البشرية
    canManageHR: true,
    canViewEmployeeSalaries: true,
    canManageTraining: true,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: true,
    canManageCompliance: true,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: true,
    canManageProjects: true,
    
    // صلاحيات العلاقات العامة
    canManagePR: true,
    
    // صلاحيات البطولات
    canManageTournaments: true,
    
    // صلاحيات الوسائط
    canManageMedia: true,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // مشرف - صلاحيات واسعة
  supervisor: {
    // صلاحيات المستخدمين
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: true,
    canManagePayments: true,
    canManageInvoices: true,
    canManageSubscriptions: true,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    
    // صلاحيات المحتوى
    canManageContent: true,
    canManageAds: true,
    canManageVideos: true,
    canManageDreamAcademy: true,
    
    // صلاحيات الموظفين
    canManageEmployees: true,
    canViewEmployees: true,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: true,
    canManageSupport: true,
    canAssignTickets: true,
    
    // صلاحيات العملاء
    canManageCustomers: true,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: true,
    canManageNotifications: true,
    
    // صلاحيات البيانات
    canExportData: true,
    canImportData: true,
    canViewAuditLogs: true,
    
    // صلاحيات الموارد البشرية
    canManageHR: true,
    canViewEmployeeSalaries: true,
    canManageTraining: true,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: true,
    canManageCompliance: true,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: true,
    canManageProjects: true,
    
    // صلاحيات العلاقات العامة
    canManagePR: true,
    
    // صلاحيات البطولات
    canManageTournaments: true,
    
    // صلاحيات الوسائط
    canManageMedia: true,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // محلل أداء الوسائط
  media_analyst: {
    // صلاحيات المستخدمين
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    
    // صلاحيات المحتوى
    canManageContent: true,
    canManageAds: true,
    canManageVideos: true,
    canManageDreamAcademy: true,
    
    // صلاحيات الموظفين
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    
    // صلاحيات العملاء
    canManageCustomers: false,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    
    // صلاحيات البيانات
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: false,
    
    // صلاحيات الموارد البشرية
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: false,
    canManageCompliance: false,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: false,
    canManageProjects: false,
    
    // صلاحيات العلاقات العامة
    canManagePR: false,
    
    // صلاحيات البطولات
    canManageTournaments: false,
    
    // صلاحيات الوسائط
    canManageMedia: true,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // مدير التسويق
  marketing_manager: {
    // صلاحيات المستخدمين
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    
    // صلاحيات المحتوى
    canManageContent: true,
    canManageAds: true,
    canManageVideos: true,
    canManageDreamAcademy: true,
    
    // صلاحيات الموظفين
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    
    // صلاحيات العملاء
    canManageCustomers: false,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: true,
    
    // صلاحيات البيانات
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: false,
    
    // صلاحيات الموارد البشرية
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: false,
    canManageCompliance: false,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: false,
    canManageProjects: false,
    
    // صلاحيات العلاقات العامة
    canManagePR: true,
    
    // صلاحيات البطولات
    canManageTournaments: false,
    
    // صلاحيات الوسائط
    canManageMedia: true,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // مدير الدعم الفني
  support: {
    // صلاحيات المستخدمين
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: false,
    canGenerateReports: false,
    
    // صلاحيات المحتوى
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    
    // صلاحيات الموظفين
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: true,
    canManageSupport: true,
    canAssignTickets: true,
    
    // صلاحيات العملاء
    canManageCustomers: true,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: true,
    canManageNotifications: false,
    
    // صلاحيات البيانات
    canExportData: false,
    canImportData: false,
    canViewAuditLogs: false,
    
    // صلاحيات الموارد البشرية
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: false,
    canManageCompliance: false,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: false,
    canManageProjects: false,
    
    // صلاحيات العلاقات العامة
    canManagePR: false,
    
    // صلاحيات البطولات
    canManageTournaments: false,
    
    // صلاحيات الوسائط
    canManageMedia: false,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // مدير المالية
  finance: {
    // صلاحيات المستخدمين
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: true,
    canManagePayments: true,
    canManageInvoices: true,
    canManageSubscriptions: true,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    
    // صلاحيات المحتوى
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    
    // صلاحيات الموظفين
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    
    // صلاحيات العملاء
    canManageCustomers: false,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    
    // صلاحيات البيانات
    canExportData: true,
    canImportData: true,
    canViewAuditLogs: false,
    
    // صلاحيات الموارد البشرية
    canManageHR: false,
    canViewEmployeeSalaries: true,
    canManageTraining: false,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: false,
    canManageCompliance: true,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: true,
    canManageProjects: false,
    
    // صلاحيات العلاقات العامة
    canManagePR: false,
    
    // صلاحيات البطولات
    canManageTournaments: false,
    
    // صلاحيات الوسائط
    canManageMedia: false,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // خدمة العملاء الهاتفية
  customer_service: {
    // صلاحيات المستخدمين
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: false,
    canGenerateReports: false,
    
    // صلاحيات المحتوى
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    
    // صلاحيات الموظفين
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: true,
    canManageSupport: true,
    canAssignTickets: false,
    
    // صلاحيات العملاء
    canManageCustomers: true,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: true,
    
    // صلاحيات البيانات
    canExportData: false,
    canImportData: false,
    canViewAuditLogs: false,
    
    // صلاحيات الموارد البشرية
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: false,
    canManageCompliance: false,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: false,
    canManageProjects: false,
    
    // صلاحيات العلاقات العامة
    canManagePR: false,
    
    // صلاحيات البطولات
    canManageTournaments: false,
    
    // صلاحيات الوسائط
    canManageMedia: false,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // مشرف إدارة العملاء
  customer_supervisor: {
    // صلاحيات المستخدمين
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    
    // صلاحيات المالية
    canViewFinancials: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    
    // صلاحيات التقارير والتحليلات
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    
    // صلاحيات المحتوى
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    
    // صلاحيات الموظفين
    canManageEmployees: true,
    canViewEmployees: true,
    canManageRoles: false,
    
    // صلاحيات الدعم الفني
    canViewSupport: true,
    canManageSupport: true,
    canAssignTickets: true,
    
    // صلاحيات العملاء
    canManageCustomers: true,
    canViewCustomerData: true,
    
    // صلاحيات النظام
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: true,
    
    // صلاحيات البيانات
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: false,
    
    // صلاحيات الموارد البشرية
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    
    // صلاحيات الجودة والامتثال
    canManageQuality: false,
    canManageCompliance: false,
    
    // صلاحيات الأصول والمشاريع
    canManageAssets: false,
    canManageProjects: false,
    
    // صلاحيات العلاقات العامة
    canManagePR: false,
    
    // صلاحيات البطولات
    canManageTournaments: false,
    
    // صلاحيات الوسائط
    canManageMedia: false,
    
    // المناطق المسموح بها
    allowedLocations: []
  },

  // باقي الأدوار - صلاحيات محدودة
  sales: {
    canViewUsers: true,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: false,
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: true,
    canViewCustomerData: true,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    canExportData: false,
    canImportData: false,
    canViewAuditLogs: false,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: false,
    allowedLocations: []
  },

  content: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: false,
    canManageContent: true,
    canManageAds: true,
    canManageVideos: true,
    canManageDreamAcademy: true,
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: false,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    canExportData: false,
    canImportData: false,
    canViewAuditLogs: false,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: true,
    allowedLocations: []
  },

  // الأدوار الجديدة - صلاحيات محدودة
  hr_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    canManageEmployees: true,
    canViewEmployees: true,
    canManageRoles: true,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: false,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    canExportData: true,
    canImportData: true,
    canViewAuditLogs: false,
    canManageHR: true,
    canViewEmployeeSalaries: true,
    canManageTraining: true,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: false,
    allowedLocations: []
  },

  quality_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    canManageEmployees: false,
    canViewEmployees: true,
    canManageRoles: false,
    canViewSupport: true,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: true,
    canManageSettings: false,
    canViewSystemHealth: true,
    canManageNotifications: false,
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: true,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: true,
    canManageCompliance: true,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: false,
    allowedLocations: []
  },

  compliance_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    canManageEmployees: false,
    canViewEmployees: true,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: true,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: true,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: false,
    canManageCompliance: true,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: false,
    allowedLocations: []
  },

  training_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: true,
    canManageAds: false,
    canManageVideos: true,
    canManageDreamAcademy: true,
    canManageEmployees: false,
    canViewEmployees: true,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: false,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: true,
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: false,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: true,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: true,
    allowedLocations: []
  },

  assets_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: false,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: false,
    canExportData: true,
    canImportData: true,
    canViewAuditLogs: false,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: true,
    canManageProjects: false,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: false,
    allowedLocations: []
  },

  projects_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: false,
    canManageAds: false,
    canManageVideos: false,
    canManageDreamAcademy: false,
    canManageEmployees: false,
    canViewEmployees: true,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: false,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: true,
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: false,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: false,
    canManageProjects: true,
    canManagePR: false,
    canManageTournaments: false,
    canManageMedia: false,
    allowedLocations: []
  },

  pr_manager: {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFinancials: false,
    canManagePayments: false,
    canManageInvoices: false,
    canManageSubscriptions: false,
    canViewReports: true,
    canViewAnalytics: true,
    canGenerateReports: true,
    canManageContent: true,
    canManageAds: true,
    canManageVideos: true,
    canManageDreamAcademy: false,
    canManageEmployees: false,
    canViewEmployees: false,
    canManageRoles: false,
    canViewSupport: false,
    canManageSupport: false,
    canAssignTickets: false,
    canManageCustomers: false,
    canViewCustomerData: false,
    canManageSettings: false,
    canViewSystemHealth: false,
    canManageNotifications: true,
    canExportData: true,
    canImportData: false,
    canViewAuditLogs: false,
    canManageHR: false,
    canViewEmployeeSalaries: false,
    canManageTraining: false,
    canManageQuality: false,
    canManageCompliance: false,
    canManageAssets: false,
    canManageProjects: false,
    canManagePR: true,
    canManageTournaments: false,
    canManageMedia: true,
    allowedLocations: []
  }
};

// دالة للحصول على الصلاحيات الافتراضية لدور معين
export function getDefaultPermissions(role: EmployeeRole): RolePermissions {
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.support;
}

// دالة للتحقق من صلاحية معينة
export function hasPermission(permissions: RolePermissions, permission: keyof RolePermissions): boolean {
  return permissions[permission] === true;
}

// دالة للتحقق من عدة صلاحيات
export function hasAnyPermission(permissions: RolePermissions, permissionList: (keyof RolePermissions)[]): boolean {
  return permissionList.some(permission => hasPermission(permissions, permission));
}

// دالة للتحقق من جميع الصلاحيات
export function hasAllPermissions(permissions: RolePermissions, permissionList: (keyof RolePermissions)[]): boolean {
  return permissionList.every(permission => hasPermission(permissions, permission));
}


