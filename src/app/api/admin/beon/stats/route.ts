import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const STATS_FILE_PATH = join(process.cwd(), 'data', 'beon-stats.json');

interface MessageStats {
  totalSent: number;
  successful: number;
  failed: number;
  pending: number;
  todaySent: number;
  thisWeekSent: number;
  thisMonthSent: number;
  lastReset: string;
  dailyStats: Record<string, number>;
  hourlyStats: Record<string, number>;
  errorStats: Record<string, number>;
  topPhones: Record<string, number>;
  messageTypes: {
    sms: number;
    whatsapp: number;
    unified: number;
  };
}

// إنشاء مجلد البيانات إذا لم يكن موجوداً
async function ensureDataDirectory() {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
  } catch (error) {
    // المجلد موجود بالفعل
  }
}

// قراءة الإحصائيات
async function readStats(): Promise<MessageStats | null> {
  try {
    await ensureDataDirectory();
    const statsData = await readFile(STATS_FILE_PATH, 'utf-8');
    return JSON.parse(statsData);
  } catch (error) {
    return null;
  }
}

// كتابة الإحصائيات
async function writeStats(stats: MessageStats): Promise<void> {
  await ensureDataDirectory();
  await writeFile(STATS_FILE_PATH, JSON.stringify(stats, null, 2), 'utf-8');
}

// الإحصائيات الافتراضية
const DEFAULT_STATS: MessageStats = {
  totalSent: 0,
  successful: 0,
  failed: 0,
  pending: 0,
  todaySent: 0,
  thisWeekSent: 0,
  thisMonthSent: 0,
  lastReset: new Date().toISOString(),
  dailyStats: {},
  hourlyStats: {},
  errorStats: {},
  topPhones: {},
  messageTypes: {
    sms: 0,
    whatsapp: 0,
    unified: 0
  }
};

// تحديث الإحصائيات اليومية
function updateDailyStats(stats: MessageStats): MessageStats {
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  return {
    ...stats,
    dailyStats: {
      ...stats.dailyStats,
      [today]: (stats.dailyStats[today] || 0) + 1
    },
    hourlyStats: {
      ...stats.hourlyStats,
      [currentHour.toString()]: (stats.hourlyStats[currentHour.toString()] || 0) + 1
    }
  };
}

// GET - جلب الإحصائيات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const reset = searchParams.get('reset') === 'true';

    let stats = await readStats();
    
    if (!stats) {
      stats = DEFAULT_STATS;
      await writeStats(stats);
    }

    // إعادة تعيين الإحصائيات إذا طُلب ذلك
    if (reset) {
      stats = {
        ...DEFAULT_STATS,
        lastReset: new Date().toISOString()
      };
      await writeStats(stats);
    }

    // حساب معدل النجاح
    const successRate = stats.totalSent > 0 ? (stats.successful / stats.totalSent) * 100 : 0;

    // حساب الإحصائيات حسب الفترة
    let filteredStats = stats;
    if (period === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredStats = {
        ...stats,
        totalSent: stats.dailyStats[today] || 0,
        successful: Math.round((stats.dailyStats[today] || 0) * (successRate / 100)),
        failed: Math.round((stats.dailyStats[today] || 0) * ((100 - successRate) / 100))
      };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStats = Object.entries(stats.dailyStats)
        .filter(([date]) => new Date(date) >= weekAgo)
        .reduce((sum, [, count]) => sum + count, 0);
      
      filteredStats = {
        ...stats,
        totalSent: weekStats,
        successful: Math.round(weekStats * (successRate / 100)),
        failed: Math.round(weekStats * ((100 - successRate) / 100))
      };
    }

    return NextResponse.json({
      success: true,
      message: 'تم جلب الإحصائيات بنجاح',
      data: {
        ...filteredStats,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round((100 - successRate) * 100) / 100,
        averagePerDay: stats.totalSent > 0 ? Math.round(stats.totalSent / Math.max(1, Object.keys(stats.dailyStats).length)) : 0,
        peakHour: Object.entries(stats.hourlyStats).reduce((max, [hour, count]) => 
          count > max.count ? { hour, count } : max, { hour: '0', count: 0 }
        ),
        topError: Object.entries(stats.errorStats).reduce((max, [error, count]) => 
          count > max.count ? { error, count } : max, { error: 'none', count: 0 }
        )
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}

// POST - تحديث الإحصائيات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      phone, 
      messageType = 'sms', 
      error = null,
      success = true 
    } = body;

    if (!type || !['sent', 'success', 'failed', 'pending'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'نوع التحديث غير صحيح' },
        { status: 400 }
      );
    }

    let stats = await readStats();
    if (!stats) {
      stats = DEFAULT_STATS;
    }

    // تحديث الإحصائيات الأساسية
    switch (type) {
      case 'sent':
        stats.totalSent += 1;
        stats.todaySent += 1;
        stats.thisWeekSent += 1;
        stats.thisMonthSent += 1;
        
        // تحديث نوع الرسالة
        if (messageType in stats.messageTypes) {
          stats.messageTypes[messageType as keyof typeof stats.messageTypes] += 1;
        }
        
        // تحديث الإحصائيات اليومية والساعية
        stats = updateDailyStats(stats);
        
        // تحديث أفضل الأرقام
        if (phone) {
          stats.topPhones[phone] = (stats.topPhones[phone] || 0) + 1;
        }
        break;
        
      case 'success':
        stats.successful += 1;
        break;
        
      case 'failed':
        stats.failed += 1;
        if (error) {
          stats.errorStats[error] = (stats.errorStats[error] || 0) + 1;
        }
        break;
        
      case 'pending':
        stats.pending += 1;
        break;
    }

    // حفظ الإحصائيات المحدثة
    await writeStats(stats);

    console.log('📊 تم تحديث إحصائيات BeOn V3:', {
      type,
      phone,
      messageType,
      error,
      success,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الإحصائيات بنجاح',
      data: {
        totalSent: stats.totalSent,
        successful: stats.successful,
        failed: stats.failed,
        pending: stats.pending,
        successRate: stats.totalSent > 0 ? Math.round((stats.successful / stats.totalSent) * 100) : 0
      }
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الإحصائيات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الإحصائيات' },
      { status: 500 }
    );
  }
}

// PUT - تحديث إحصائيات متعددة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'التحديثات مطلوبة' },
        { status: 400 }
      );
    }

    let stats = await readStats();
    if (!stats) {
      stats = DEFAULT_STATS;
    }

    // تطبيق التحديثات
    const updatedStats = {
      ...stats,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    // حفظ الإحصائيات المحدثة
    await writeStats(updatedStats);

    console.log('📊 تم تحديث إحصائيات BeOn V3 متعددة:', {
      updatedFields: Object.keys(updates),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الإحصائيات بنجاح',
      data: updatedStats
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الإحصائيات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الإحصائيات' },
      { status: 500 }
    );
  }
}

// DELETE - إعادة تعيين الإحصائيات
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resetType = searchParams.get('type') || 'all';

    let stats = await readStats();
    if (!stats) {
      stats = DEFAULT_STATS;
    }

    if (resetType === 'all') {
      // إعادة تعيين كاملة
      stats = {
        ...DEFAULT_STATS,
        lastReset: new Date().toISOString()
      };
    } else if (resetType === 'daily') {
      // إعادة تعيين الإحصائيات اليومية
      stats.todaySent = 0;
      stats.dailyStats = {};
      stats.hourlyStats = {};
    } else if (resetType === 'errors') {
      // إعادة تعيين إحصائيات الأخطاء
      stats.errorStats = {};
    }

    await writeStats(stats);

    console.log('🔄 تم إعادة تعيين إحصائيات BeOn V3:', {
      resetType,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `تم إعادة تعيين الإحصائيات (${resetType}) بنجاح`,
      data: stats
    });

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين الإحصائيات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إعادة تعيين الإحصائيات' },
      { status: 500 }
    );
  }
}


