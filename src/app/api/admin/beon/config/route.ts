import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CONFIG_FILE_PATH = join(process.cwd(), 'data', 'beon-config.json');

interface BeOnConfig {
  baseUrl: string;
  token: string;
  sender: string;
  language: string;
  maxRetries: number;
  timeout: number;
  rateLimit: number;
  emergencyMode: boolean;
  backupProvider: string;
  autoRetry: boolean;
  logLevel: string;
  lastUpdated: string;
  updatedBy: string;
}

// إنشاء مجلد البيانات إذا لم يكن موجوداً
async function ensureDataDirectory() {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
  } catch (error) {
    // المجلد موجود بالفعل
  }
}

// قراءة الإعدادات
async function readConfig(): Promise<BeOnConfig | null> {
  try {
    await ensureDataDirectory();
    const configData = await readFile(CONFIG_FILE_PATH, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    return null;
  }
}

// كتابة الإعدادات
async function writeConfig(config: BeOnConfig): Promise<void> {
  await ensureDataDirectory();
  await writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// الإعدادات الافتراضية
const DEFAULT_CONFIG: BeOnConfig = {
  baseUrl: 'https://v3.api.beon.chat',
  token: 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv',
  sender: 'El7lm',
  language: 'ar',
  maxRetries: 3,
  timeout: 30000,
  rateLimit: 100,
  emergencyMode: false,
  backupProvider: 'none',
  autoRetry: true,
  logLevel: 'info',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'admin'
};

// GET - جلب الإعدادات
export async function GET(request: NextRequest) {
  try {
    const config = await readConfig();
    
    if (!config) {
      // إنشاء ملف إعدادات جديد بالإعدادات الافتراضية
      await writeConfig(DEFAULT_CONFIG);
      return NextResponse.json({
        success: true,
        message: 'تم إنشاء إعدادات جديدة',
        data: DEFAULT_CONFIG
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم جلب الإعدادات بنجاح',
      data: config
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الإعدادات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// POST - حفظ الإعدادات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, updatedBy = 'admin' } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'الإعدادات مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة الإعدادات
    const validatedConfig: BeOnConfig = {
      baseUrl: config.baseUrl || DEFAULT_CONFIG.baseUrl,
      token: config.token || DEFAULT_CONFIG.token,
      sender: config.sender || DEFAULT_CONFIG.sender,
      language: config.language || DEFAULT_CONFIG.language,
      maxRetries: Math.max(1, Math.min(10, config.maxRetries || DEFAULT_CONFIG.maxRetries)),
      timeout: Math.max(5000, Math.min(120000, config.timeout || DEFAULT_CONFIG.timeout)),
      rateLimit: Math.max(1, Math.min(1000, config.rateLimit || DEFAULT_CONFIG.rateLimit)),
      emergencyMode: Boolean(config.emergencyMode),
      backupProvider: config.backupProvider || DEFAULT_CONFIG.backupProvider,
      autoRetry: Boolean(config.autoRetry),
      logLevel: config.logLevel || DEFAULT_CONFIG.logLevel,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };

    // حفظ الإعدادات
    await writeConfig(validatedConfig);

    // تسجيل التغيير
    console.log('✅ تم تحديث إعدادات BeOn V3:', {
      updatedBy,
      timestamp: validatedConfig.lastUpdated,
      changes: Object.keys(config)
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      data: validatedConfig
    });

  } catch (error) {
    console.error('❌ خطأ في حفظ الإعدادات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حفظ الإعدادات' },
      { status: 500 }
    );
  }
}

// PUT - تحديث إعدادات محددة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates, updatedBy = 'admin' } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'التحديثات مطلوبة' },
        { status: 400 }
      );
    }

    // قراءة الإعدادات الحالية
    const currentConfig = await readConfig();
    if (!currentConfig) {
      return NextResponse.json(
        { success: false, error: 'لا توجد إعدادات موجودة' },
        { status: 404 }
      );
    }

    // تحديث الإعدادات
    const updatedConfig: BeOnConfig = {
      ...currentConfig,
      ...updates,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };

    // حفظ الإعدادات المحدثة
    await writeConfig(updatedConfig);

    console.log('✅ تم تحديث إعدادات BeOn V3 جزئياً:', {
      updatedBy,
      timestamp: updatedConfig.lastUpdated,
      updatedFields: Object.keys(updates)
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      data: updatedConfig
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الإعدادات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الإعدادات' },
      { status: 500 }
    );
  }
}

// DELETE - إعادة تعيين الإعدادات
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resetToDefault = searchParams.get('reset') === 'true';

    if (resetToDefault) {
      // إعادة تعيين للإعدادات الافتراضية
      await writeConfig(DEFAULT_CONFIG);
      
      console.log('🔄 تم إعادة تعيين إعدادات BeOn V3 للإعدادات الافتراضية');
      
      return NextResponse.json({
        success: true,
        message: 'تم إعادة تعيين الإعدادات للإعدادات الافتراضية',
        data: DEFAULT_CONFIG
      });
    } else {
      // حذف ملف الإعدادات
      try {
        await import('fs/promises').then(fs => fs.unlink(CONFIG_FILE_PATH));
      } catch (error) {
        // الملف غير موجود
      }
      
      console.log('🗑️ تم حذف إعدادات BeOn V3');
      
      return NextResponse.json({
        success: true,
        message: 'تم حذف الإعدادات بنجاح'
      });
    }

  } catch (error) {
    console.error('❌ خطأ في حذف الإعدادات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف الإعدادات' },
      { status: 500 }
    );
  }
}


