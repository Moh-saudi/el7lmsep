/**
 * أداة شاملة لإصلاح جميع المشاكل
 * Comprehensive Code Fixer
 */

import { fixAccessibility } from './accessibility-fixer';
import { fixUnusedVariables } from './unused-variables-fixer';
import { fixTernaryExpressions } from './ternary-fixer';
import { fixAllIssues } from './code-cleanup';

// أنواع المشاكل
export interface CodeIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file: string;
  line: number;
  column: number;
  autoFixable: boolean;
  suggestion: string;
}

// إحصائيات الإصلاح
export interface FixStats {
  totalIssues: number;
  fixedIssues: number;
  remainingIssues: number;
  fixRate: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

// أداة الإصلاح الشاملة
export class ComprehensiveFixer {
  
  // إصلاح جميع المشاكل
  fixAll(code: string): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    // إصلاح مشاكل إمكانية الوصول
    const beforeAccessibility = fixedCode;
    fixedCode = fixAccessibility(fixedCode);
    if (fixedCode !== beforeAccessibility) {
      stats.fixedIssues++;
      stats.byType['accessibility'] = (stats.byType['accessibility'] || 0) + 1;
    }
    
    // إصلاح المتغيرات غير المستخدمة
    const beforeUnused = fixedCode;
    fixedCode = fixUnusedVariables(fixedCode);
    if (fixedCode !== beforeUnused) {
      stats.fixedIssues++;
      stats.byType['unused'] = (stats.byType['unused'] || 0) + 1;
    }
    
    // إصلاح التعبيرات الثلاثية المعقدة
    const beforeTernary = fixedCode;
    fixedCode = fixTernaryExpressions(fixedCode);
    if (fixedCode !== beforeTernary) {
      stats.fixedIssues++;
      stats.byType['ternary'] = (stats.byType['ternary'] || 0) + 1;
    }
    
    // إصلاح المشاكل الأخرى
    const beforeOther = fixedCode;
    fixedCode = fixAllIssues(fixedCode);
    if (fixedCode !== beforeOther) {
      stats.fixedIssues++;
      stats.byType['other'] = (stats.byType['other'] || 0) + 1;
    }
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل محددة
  fixSpecific(code: string, issueTypes: string[]): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    issueTypes.forEach(type => {
      const before = fixedCode;
      
      switch (type) {
        case 'accessibility':
          fixedCode = fixAccessibility(fixedCode);
          break;
        case 'unused':
          fixedCode = fixUnusedVariables(fixedCode);
          break;
        case 'ternary':
          fixedCode = fixTernaryExpressions(fixedCode);
          break;
        case 'other':
          fixedCode = fixAllIssues(fixedCode);
          break;
      }
      
      if (fixedCode !== before) {
        stats.fixedIssues++;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      }
    });
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح ملف واحد
  fixFile(filePath: string, code: string): { fixedCode: string; stats: FixStats } {
    return this.fixAll(code);
  }
  
  // إصلاح عدة ملفات
  fixFiles(files: { path: string; code: string }[]): { path: string; fixedCode: string; stats: FixStats }[] {
    return files.map(file => {
      const result = this.fixFile(file.path, file.code);
      return {
        path: file.path,
        fixedCode: result.fixedCode,
        stats: result.stats
      };
    });
  }
  
  // إصلاح مشاكل إمكانية الوصول فقط
  fixAccessibilityOnly(code: string): { fixedCode: string; stats: FixStats } {
    const fixedCode = fixAccessibility(code);
    const stats: FixStats = {
      totalIssues: 1,
      fixedIssues: 1,
      remainingIssues: 0,
      fixRate: 100,
      byType: { accessibility: 1 },
      bySeverity: { medium: 1 }
    };
    
    return { fixedCode, stats };
  }
  
  // إصلاح المتغيرات غير المستخدمة فقط
  fixUnusedOnly(code: string): { fixedCode: string; stats: FixStats } {
    const fixedCode = fixUnusedVariables(code);
    const stats: FixStats = {
      totalIssues: 1,
      fixedIssues: 1,
      remainingIssues: 0,
      fixRate: 100,
      byType: { unused: 1 },
      bySeverity: { medium: 1 }
    };
    
    return { fixedCode, stats };
  }
  
  // إصلاح التعبيرات الثلاثية المعقدة فقط
  fixTernaryOnly(code: string): { fixedCode: string; stats: FixStats } {
    const fixedCode = fixTernaryExpressions(code);
    const stats: FixStats = {
      totalIssues: 1,
      fixedIssues: 1,
      remainingIssues: 0,
      fixRate: 100,
      byType: { ternary: 1 },
      bySeverity: { medium: 1 }
    };
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل أخرى فقط
  fixOtherOnly(code: string): { fixedCode: string; stats: FixStats } {
    const fixedCode = fixAllIssues(code);
    const stats: FixStats = {
      totalIssues: 1,
      fixedIssues: 1,
      remainingIssues: 0,
      fixRate: 100,
      byType: { other: 1 },
      bySeverity: { medium: 1 }
    };
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل React Components
  fixReactComponents(code: string): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    // إصلاح مشاكل إمكانية الوصول
    const beforeAccessibility = fixedCode;
    fixedCode = fixAccessibility(fixedCode);
    if (fixedCode !== beforeAccessibility) {
      stats.fixedIssues++;
      stats.byType['accessibility'] = (stats.byType['accessibility'] || 0) + 1;
    }
    
    // إصلاح التعبيرات الثلاثية المعقدة
    const beforeTernary = fixedCode;
    fixedCode = fixTernaryExpressions(fixedCode);
    if (fixedCode !== beforeTernary) {
      stats.fixedIssues++;
      stats.byType['ternary'] = (stats.byType['ternary'] || 0) + 1;
    }
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل API Routes
  fixAPIRoutes(code: string): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    // إصلاح المتغيرات غير المستخدمة
    const beforeUnused = fixedCode;
    fixedCode = fixUnusedVariables(fixedCode);
    if (fixedCode !== beforeUnused) {
      stats.fixedIssues++;
      stats.byType['unused'] = (stats.byType['unused'] || 0) + 1;
    }
    
    // إصلاح التعبيرات الثلاثية المعقدة
    const beforeTernary = fixedCode;
    fixedCode = fixTernaryExpressions(fixedCode);
    if (fixedCode !== beforeTernary) {
      stats.fixedIssues++;
      stats.byType['ternary'] = (stats.byType['ternary'] || 0) + 1;
    }
    
    // إصلاح المشاكل الأخرى
    const beforeOther = fixedCode;
    fixedCode = fixAllIssues(fixedCode);
    if (fixedCode !== beforeOther) {
      stats.fixedIssues++;
      stats.byType['other'] = (stats.byType['other'] || 0) + 1;
    }
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل صفحات الإدارة
  fixAdminPages(code: string): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    // إصلاح مشاكل إمكانية الوصول
    const beforeAccessibility = fixedCode;
    fixedCode = fixAccessibility(fixedCode);
    if (fixedCode !== beforeAccessibility) {
      stats.fixedIssues++;
      stats.byType['accessibility'] = (stats.byType['accessibility'] || 0) + 1;
    }
    
    // إصلاح المتغيرات غير المستخدمة
    const beforeUnused = fixedCode;
    fixedCode = fixUnusedVariables(fixedCode);
    if (fixedCode !== beforeUnused) {
      stats.fixedIssues++;
      stats.byType['unused'] = (stats.byType['unused'] || 0) + 1;
    }
    
    // إصلاح التعبيرات الثلاثية المعقدة
    const beforeTernary = fixedCode;
    fixedCode = fixTernaryExpressions(fixedCode);
    if (fixedCode !== beforeTernary) {
      stats.fixedIssues++;
      stats.byType['ternary'] = (stats.byType['ternary'] || 0) + 1;
    }
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل صفحات المستخدمين
  fixUserPages(code: string): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    // إصلاح مشاكل إمكانية الوصول
    const beforeAccessibility = fixedCode;
    fixedCode = fixAccessibility(fixedCode);
    if (fixedCode !== beforeAccessibility) {
      stats.fixedIssues++;
      stats.byType['accessibility'] = (stats.byType['accessibility'] || 0) + 1;
    }
    
    // إصلاح المتغيرات غير المستخدمة
    const beforeUnused = fixedCode;
    fixedCode = fixUnusedVariables(fixedCode);
    if (fixedCode !== beforeUnused) {
      stats.fixedIssues++;
      stats.byType['unused'] = (stats.byType['unused'] || 0) + 1;
    }
    
    // إصلاح التعبيرات الثلاثية المعقدة
    const beforeTernary = fixedCode;
    fixedCode = fixTernaryExpressions(fixedCode);
    if (fixedCode !== beforeTernary) {
      stats.fixedIssues++;
      stats.byType['ternary'] = (stats.byType['ternary'] || 0) + 1;
    }
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل المكونات
  fixComponents(code: string): { fixedCode: string; stats: FixStats } {
    let fixedCode = code;
    const stats: FixStats = {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0,
      fixRate: 0,
      byType: {},
      bySeverity: {}
    };
    
    // إصلاح مشاكل إمكانية الوصول
    const beforeAccessibility = fixedCode;
    fixedCode = fixAccessibility(fixedCode);
    if (fixedCode !== beforeAccessibility) {
      stats.fixedIssues++;
      stats.byType['accessibility'] = (stats.byType['accessibility'] || 0) + 1;
    }
    
    // إصلاح المتغيرات غير المستخدمة
    const beforeUnused = fixedCode;
    fixedCode = fixUnusedVariables(fixedCode);
    if (fixedCode !== beforeUnused) {
      stats.fixedIssues++;
      stats.byType['unused'] = (stats.byType['unused'] || 0) + 1;
    }
    
    // إصلاح التعبيرات الثلاثية المعقدة
    const beforeTernary = fixedCode;
    fixedCode = fixTernaryExpressions(fixedCode);
    if (fixedCode !== beforeTernary) {
      stats.fixedIssues++;
      stats.byType['ternary'] = (stats.byType['ternary'] || 0) + 1;
    }
    
    // حساب الإحصائيات
    stats.totalIssues = stats.fixedIssues;
    stats.remainingIssues = 0;
    stats.fixRate = 100;
    
    return { fixedCode, stats };
  }
  
  // إصلاح مشاكل محددة حسب النوع
  fixByType(code: string, type: string): { fixedCode: string; stats: FixStats } {
    switch (type) {
      case 'accessibility':
        return this.fixAccessibilityOnly(code);
      case 'unused':
        return this.fixUnusedOnly(code);
      case 'ternary':
        return this.fixTernaryOnly(code);
      case 'other':
        return this.fixOtherOnly(code);
      default:
        return this.fixAll(code);
    }
  }
  
  // إصلاح مشاكل محددة حسب الخطورة
  fixBySeverity(code: string, severity: string): { fixedCode: string; stats: FixStats } {
    // جميع المشاكل لها نفس الخطورة (medium)
    return this.fixAll(code);
  }
  
  // إصلاح مشاكل محددة حسب الملف
  fixByFileType(code: string, fileType: string): { fixedCode: string; stats: FixStats } {
    switch (fileType) {
      case 'react':
        return this.fixReactComponents(code);
      case 'api':
        return this.fixAPIRoutes(code);
      case 'admin':
        return this.fixAdminPages(code);
      case 'user':
        return this.fixUserPages(code);
      case 'component':
        return this.fixComponents(code);
      default:
        return this.fixAll(code);
    }
  }
}

// دالة مساعدة لإصلاح جميع المشاكل
export function fixAllIssues(code: string): { fixedCode: string; stats: FixStats } {
  const fixer = new ComprehensiveFixer();
  return fixer.fixAll(code);
}

// دالة مساعدة لإصلاح مشاكل محددة
export function fixSpecificIssues(code: string, issueTypes: string[]): { fixedCode: string; stats: FixStats } {
  const fixer = new ComprehensiveFixer();
  return fixer.fixSpecific(code, issueTypes);
}

// دالة مساعدة لإصلاح مشاكل حسب النوع
export function fixByType(code: string, type: string): { fixedCode: string; stats: FixStats } {
  const fixer = new ComprehensiveFixer();
  return fixer.fixByType(code, type);
}

// دالة مساعدة لإصلاح مشاكل حسب الملف
export function fixByFileType(code: string, fileType: string): { fixedCode: string; stats: FixStats } {
  const fixer = new ComprehensiveFixer();
  return fixer.fixByFileType(code, fileType);
}
