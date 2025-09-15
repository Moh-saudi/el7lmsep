import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { BEON_V3_CONFIG, createBeOnHeaders } from '@/lib/beon/config';

const ACCOUNT_FILE_PATH = join(process.cwd(), 'data', 'beon-account.json');

interface AccountInfo {
  status: string;
  balance: number;
  currency: string;
  lastActivity: string;
  plan: string;
  limits: {
    daily: number;
    monthly: number;
    perMinute: number;
  };
  usage: {
    dailyUsed: number;
    monthlyUsed: number;
    lastReset: string;
  };
  alerts: {
    lowBalance: boolean;
    highUsage: boolean;
    rateLimit: boolean;
  };
  lastChecked: string;
  checkedBy: string;
}

// إنشاء مجلد البيانات إذا لم يكن موجوداً
async function ensureDataDirectory() {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
  } catch (error) {
    // المجلد موجود بالفعل
  }
}

// قراءة معلومات الحساب
async function readAccountInfo(): Promise<AccountInfo | null> {
  try {
    await ensureDataDirectory();
    const accountData = await readFile(ACCOUNT_FILE_PATH, 'utf-8');
    return JSON.parse(accountData);
  } catch (error) {
    return null;
  }
}

// كتابة معلومات الحساب
async function writeAccountInfo(accountInfo: AccountInfo): Promise<void> {
  await ensureDataDirectory();
  await writeFile(ACCOUNT_FILE_PATH, JSON.stringify(accountInfo, null, 2), 'utf-8');
}

// معلومات الحساب الافتراضية
const DEFAULT_ACCOUNT_INFO: AccountInfo = {
  status: 'unknown',
  balance: 0,
  currency: 'USD',
  lastActivity: '',
  plan: 'unknown',
  limits: {
    daily: 1000,
    monthly: 10000,
    perMinute: 10
  },
  usage: {
    dailyUsed: 0,
    monthlyUsed: 0,
    lastReset: new Date().toISOString()
  },
  alerts: {
    lowBalance: false,
    highUsage: false,
    rateLimit: false
  },
  lastChecked: new Date().toISOString(),
  checkedBy: 'system'
};

// فحص الحساب من BeOn API
async function checkBeOnAccount(): Promise<any> {
  try {
    // محاولة endpoints مختلفة لفحص الحساب
    const accountEndpoints = [
      '/api/v3/account',
      '/api/v3/balance',
      '/api/v3/user/account',
      '/api/v3/partner/account',
      '/api/v3/account/balance',
      '/api/v3/account/info'
    ];

    for (const endpoint of accountEndpoints) {
      try {
        const response = await fetch(`${BEON_V3_CONFIG.BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: createBeOnHeaders(BEON_V3_CONFIG.TOKEN)
        });

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            endpoint,
            data,
            status: response.status
          };
        }
      } catch (error) {
        // تجاهل الأخطاء والمتابعة للـ endpoint التالي
        continue;
      }
    }

    return {
      success: false,
      error: 'لم يتم العثور على endpoint صحيح لفحص الحساب'
    };

  } catch (error) {
    return {
      success: false,
      error: 'خطأ في الاتصال بـ BeOn API'
    };
  }
}

// GET - جلب معلومات الحساب
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceCheck = searchParams.get('check') === 'true';
    const checkedBy = searchParams.get('by') || 'admin';

    let accountInfo = await readAccountInfo();
    
    if (!accountInfo) {
      accountInfo = DEFAULT_ACCOUNT_INFO;
      await writeAccountInfo(accountInfo);
    }

    // فحص الحساب من BeOn إذا طُلب ذلك
    if (forceCheck) {
      const beonResult = await checkBeOnAccount();
      
      if (beonResult.success) {
        // تحديث معلومات الحساب بناءً على استجابة BeOn
        accountInfo = {
          ...accountInfo,
          lastChecked: new Date().toISOString(),
          checkedBy: checkedBy,
          status: 'active' // افتراض أن الحساب نشط إذا استجاب
        };
        
        await writeAccountInfo(accountInfo);
      } else {
        accountInfo = {
          ...accountInfo,
          lastChecked: new Date().toISOString(),
          checkedBy: checkedBy,
          status: 'error'
        };
      }
    }

    // حساب التحذيرات
    const alerts = {
      lowBalance: accountInfo.balance < 10,
      highUsage: accountInfo.usage.dailyUsed > accountInfo.limits.daily * 0.8,
      rateLimit: accountInfo.usage.dailyUsed > accountInfo.limits.daily * 0.9
    };

    const updatedAccountInfo = {
      ...accountInfo,
      alerts
    };

    return NextResponse.json({
      success: true,
      message: 'تم جلب معلومات الحساب بنجاح',
      data: updatedAccountInfo
    });

  } catch (error) {
    console.error('❌ خطأ في جلب معلومات الحساب:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب معلومات الحساب' },
      { status: 500 }
    );
  }
}

// POST - تحديث معلومات الحساب
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      updates, 
      updatedBy = 'admin',
      checkBeOn = false 
    } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'التحديثات مطلوبة' },
        { status: 400 }
      );
    }

    let accountInfo = await readAccountInfo();
    if (!accountInfo) {
      accountInfo = DEFAULT_ACCOUNT_INFO;
    }

    // فحص الحساب من BeOn إذا طُلب ذلك
    if (checkBeOn) {
      const beonResult = await checkBeOnAccount();
      if (beonResult.success) {
        // دمج معلومات BeOn مع التحديثات
        updates.status = 'active';
        updates.lastActivity = new Date().toISOString();
      }
    }

    // تحديث معلومات الحساب
    const updatedAccountInfo: AccountInfo = {
      ...accountInfo,
      ...updates,
      lastChecked: new Date().toISOString(),
      checkedBy: updatedBy
    };

    // حفظ معلومات الحساب المحدثة
    await writeAccountInfo(updatedAccountInfo);

    console.log('✅ تم تحديث معلومات حساب BeOn V3:', {
      updatedBy,
      timestamp: updatedAccountInfo.lastChecked,
      updatedFields: Object.keys(updates)
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلومات الحساب بنجاح',
      data: updatedAccountInfo
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث معلومات الحساب:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث معلومات الحساب' },
      { status: 500 }
    );
  }
}

// PUT - تحديث الاستخدام
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      amount = 1,
      updatedBy = 'system' 
    } = body;

    if (!type || !['daily', 'monthly', 'reset'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'نوع التحديث غير صحيح' },
        { status: 400 }
      );
    }

    let accountInfo = await readAccountInfo();
    if (!accountInfo) {
      accountInfo = DEFAULT_ACCOUNT_INFO;
    }

    // تحديث الاستخدام
    switch (type) {
      case 'daily':
        accountInfo.usage.dailyUsed += amount;
        break;
      case 'monthly':
        accountInfo.usage.monthlyUsed += amount;
        break;
      case 'reset':
        const today = new Date().toISOString().split('T')[0];
        const lastReset = accountInfo.usage.lastReset.split('T')[0];
        
        if (today !== lastReset) {
          accountInfo.usage.dailyUsed = 0;
          accountInfo.usage.lastReset = new Date().toISOString();
        }
        
        // إعادة تعيين شهرية في أول يوم من الشهر
        const currentMonth = new Date().getMonth();
        const lastResetMonth = new Date(accountInfo.usage.lastReset).getMonth();
        if (currentMonth !== lastResetMonth) {
          accountInfo.usage.monthlyUsed = 0;
        }
        break;
    }

    // تحديث التحذيرات
    accountInfo.alerts = {
      lowBalance: accountInfo.balance < 10,
      highUsage: accountInfo.usage.dailyUsed > accountInfo.limits.daily * 0.8,
      rateLimit: accountInfo.usage.dailyUsed > accountInfo.limits.daily * 0.9
    };

    accountInfo.lastChecked = new Date().toISOString();
    accountInfo.checkedBy = updatedBy;

    // حفظ معلومات الحساب المحدثة
    await writeAccountInfo(accountInfo);

    console.log('📊 تم تحديث استخدام حساب BeOn V3:', {
      type,
      amount,
      updatedBy,
      timestamp: accountInfo.lastChecked
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الاستخدام بنجاح',
      data: {
        usage: accountInfo.usage,
        alerts: accountInfo.alerts,
        limits: accountInfo.limits
      }
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الاستخدام:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الاستخدام' },
      { status: 500 }
    );
  }
}

// DELETE - إعادة تعيين معلومات الحساب
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resetType = searchParams.get('type') || 'usage';
    const resetBy = searchParams.get('by') || 'admin';

    let accountInfo = await readAccountInfo();
    if (!accountInfo) {
      accountInfo = DEFAULT_ACCOUNT_INFO;
    }

    if (resetType === 'usage') {
      // إعادة تعيين الاستخدام فقط
      accountInfo.usage = {
        dailyUsed: 0,
        monthlyUsed: 0,
        lastReset: new Date().toISOString()
      };
    } else if (resetType === 'all') {
      // إعادة تعيين كامل
      accountInfo = {
        ...DEFAULT_ACCOUNT_INFO,
        lastChecked: new Date().toISOString(),
        checkedBy: resetBy
      };
    }

    await writeAccountInfo(accountInfo);

    console.log('🔄 تم إعادة تعيين معلومات حساب BeOn V3:', {
      resetType,
      resetBy,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `تم إعادة تعيين معلومات الحساب (${resetType}) بنجاح`,
      data: accountInfo
    });

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين معلومات الحساب:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إعادة تعيين معلومات الحساب' },
      { status: 500 }
    );
  }
}


