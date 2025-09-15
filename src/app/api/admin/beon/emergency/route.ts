import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const EMERGENCY_FILE_PATH = join(process.cwd(), 'data', 'beon-emergency.json');

interface EmergencyConfig {
  isActive: boolean;
  activatedAt: string;
  activatedBy: string;
  reason: string;
  backupProvider: string;
  fallbackMode: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  restrictions: {
    maxMessagesPerMinute: number;
    allowedPhones: string[];
    blockedPhones: string[];
    messageTypes: string[];
  };
  recovery: {
    autoRecovery: boolean;
    recoveryTime: string;
    recoveryChecks: number;
    lastRecoveryAttempt: string;
  };
  logs: Array<{
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }>;
}

// إنشاء مجلد البيانات إذا لم يكن موجوداً
async function ensureDataDirectory() {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
  } catch (error) {
    // المجلد موجود بالفعل
  }
}

// قراءة إعدادات الطوارئ
async function readEmergencyConfig(): Promise<EmergencyConfig | null> {
  try {
    await ensureDataDirectory();
    const emergencyData = await readFile(EMERGENCY_FILE_PATH, 'utf-8');
    return JSON.parse(emergencyData);
  } catch (error) {
    return null;
  }
}

// كتابة إعدادات الطوارئ
async function writeEmergencyConfig(config: EmergencyConfig): Promise<void> {
  await ensureDataDirectory();
  await writeFile(EMERGENCY_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// إعدادات الطوارئ الافتراضية
const DEFAULT_EMERGENCY_CONFIG: EmergencyConfig = {
  isActive: false,
  activatedAt: '',
  activatedBy: '',
  reason: '',
  backupProvider: 'none',
  fallbackMode: false,
  notifications: {
    email: true,
    sms: true,
    webhook: false
  },
  restrictions: {
    maxMessagesPerMinute: 5,
    allowedPhones: [],
    blockedPhones: [],
    messageTypes: ['sms']
  },
  recovery: {
    autoRecovery: true,
    recoveryTime: '30', // دقائق
    recoveryChecks: 0,
    lastRecoveryAttempt: ''
  },
  logs: []
};

// إضافة سجل للطوارئ
function addEmergencyLog(config: EmergencyConfig, action: string, user: string, details: string): EmergencyConfig {
  return {
    ...config,
    logs: [
      ...config.logs,
      {
        timestamp: new Date().toISOString(),
        action,
        user,
        details
      }
    ].slice(-100) // الاحتفاظ بآخر 100 سجل فقط
  };
}

// GET - جلب إعدادات الطوارئ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeLogs = searchParams.get('logs') === 'true';

    let config = await readEmergencyConfig();
    
    if (!config) {
      config = DEFAULT_EMERGENCY_CONFIG;
      await writeEmergencyConfig(config);
    }

    const responseData = {
      ...config,
      logs: includeLogs ? config.logs : config.logs.slice(-10) // آخر 10 سجلات فقط
    };

    return NextResponse.json({
      success: true,
      message: 'تم جلب إعدادات الطوارئ بنجاح',
      data: responseData
    });

  } catch (error) {
    console.error('❌ خطأ في جلب إعدادات الطوارئ:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب إعدادات الطوارئ' },
      { status: 500 }
    );
  }
}

// POST - تفعيل وضع الطوارئ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      reason, 
      activatedBy = 'admin',
      backupProvider = 'none',
      restrictions = {},
      notifications = {}
    } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'سبب تفعيل وضع الطوارئ مطلوب' },
        { status: 400 }
      );
    }

    let config = await readEmergencyConfig();
    if (!config) {
      config = DEFAULT_EMERGENCY_CONFIG;
    }

    // تفعيل وضع الطوارئ
    const updatedConfig: EmergencyConfig = {
      ...config,
      isActive: true,
      activatedAt: new Date().toISOString(),
      activatedBy: activatedBy,
      reason: reason,
      backupProvider: backupProvider,
      fallbackMode: true,
      restrictions: {
        ...config.restrictions,
        ...restrictions
      },
      notifications: {
        ...config.notifications,
        ...notifications
      },
      recovery: {
        ...config.recovery,
        recoveryChecks: 0,
        lastRecoveryAttempt: ''
      }
    };

    // إضافة سجل
    const finalConfig = addEmergencyLog(
      updatedConfig, 
      'EMERGENCY_ACTIVATED', 
      activatedBy, 
      `تم تفعيل وضع الطوارئ: ${reason}`
    );

    await writeEmergencyConfig(finalConfig);

    console.log('🚨 تم تفعيل وضع الطوارئ لـ BeOn V3:', {
      reason,
      activatedBy,
      timestamp: finalConfig.activatedAt
    });

    return NextResponse.json({
      success: true,
      message: 'تم تفعيل وضع الطوارئ بنجاح',
      data: finalConfig
    });

  } catch (error) {
    console.error('❌ خطأ في تفعيل وضع الطوارئ:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تفعيل وضع الطوارئ' },
      { status: 500 }
    );
  }
}

// PUT - تحديث إعدادات الطوارئ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      updates, 
      updatedBy = 'admin',
      action = 'UPDATE' 
    } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'التحديثات مطلوبة' },
        { status: 400 }
      );
    }

    let config = await readEmergencyConfig();
    if (!config) {
      config = DEFAULT_EMERGENCY_CONFIG;
    }

    // تحديث الإعدادات
    const updatedConfig: EmergencyConfig = {
      ...config,
      ...updates
    };

    // إضافة سجل
    const finalConfig = addEmergencyLog(
      updatedConfig, 
      action, 
      updatedBy, 
      `تم تحديث إعدادات الطوارئ: ${Object.keys(updates).join(', ')}`
    );

    await writeEmergencyConfig(finalConfig);

    console.log('⚙️ تم تحديث إعدادات طوارئ BeOn V3:', {
      updatedBy,
      action,
      updatedFields: Object.keys(updates),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث إعدادات الطوارئ بنجاح',
      data: finalConfig
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث إعدادات الطوارئ:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث إعدادات الطوارئ' },
      { status: 500 }
    );
  }
}

// DELETE - إلغاء وضع الطوارئ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deactivatedBy = searchParams.get('by') || 'admin';
    const reason = searchParams.get('reason') || 'تم إلغاء وضع الطوارئ';

    let config = await readEmergencyConfig();
    if (!config) {
      config = DEFAULT_EMERGENCY_CONFIG;
    }

    // إلغاء وضع الطوارئ
    const updatedConfig: EmergencyConfig = {
      ...config,
      isActive: false,
      fallbackMode: false,
      recovery: {
        ...config.recovery,
        lastRecoveryAttempt: new Date().toISOString()
      }
    };

    // إضافة سجل
    const finalConfig = addEmergencyLog(
      updatedConfig, 
      'EMERGENCY_DEACTIVATED', 
      deactivatedBy, 
      `تم إلغاء وضع الطوارئ: ${reason}`
    );

    await writeEmergencyConfig(finalConfig);

    console.log('✅ تم إلغاء وضع الطوارئ لـ BeOn V3:', {
      reason,
      deactivatedBy,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء وضع الطوارئ بنجاح',
      data: finalConfig
    });

  } catch (error) {
    console.error('❌ خطأ في إلغاء وضع الطوارئ:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إلغاء وضع الطوارئ' },
      { status: 500 }
    );
  }
}


