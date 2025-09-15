/**
 * محلل المشاكل وإصلاحها تلقائياً
 * Issue Analyzer and Auto-Fixer
 */

import { fixAllIssues, fixSpecificIssues } from './code-cleanup';

// أنواع المشاكل
export interface Issue {
  id: string;
  type: 'accessibility' | 'unused' | 'ternary' | 'array-key' | 'optional-chain' | 'promise' | 'regex' | 'template' | 'case-block' | 'redundant' | 'conditional';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file: string;
  line: number;
  column: number;
  autoFixable: boolean;
  suggestion: string;
}

// إحصائيات المشاكل
export interface IssueStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  autoFixable: number;
  manual: number;
}

// محلل المشاكل
export class IssueAnalyzer {
  private issues: Issue[] = [];
  
  // تحليل ملف واحد
  analyzeFile(filePath: string, code: string): Issue[] {
    const fileIssues: Issue[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineIssues = this.analyzeLine(line, filePath, index + 1);
      fileIssues.push(...lineIssues);
    });
    
    this.issues.push(...fileIssues);
    return fileIssues;
  }
  
  // تحليل سطر واحد
  private analyzeLine(line: string, filePath: string, lineNumber: number): Issue[] {
    const issues: Issue[] = [];
    
    // مشاكل إمكانية الوصول
    if (line.includes('<div onClick') && !line.includes('role=')) {
      issues.push({
        id: `accessibility-${filePath}-${lineNumber}`,
        type: 'accessibility',
        severity: 'medium',
        message: 'Avoid non-native interactive elements',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('<div onClick'),
        autoFixable: true,
        suggestion: 'Add role="button" and tabIndex={0}'
      });
    }
    
    if (line.includes('<input') && !line.includes('aria-label') && !line.includes('id=')) {
      issues.push({
        id: `accessibility-${filePath}-${lineNumber}`,
        type: 'accessibility',
        severity: 'medium',
        message: 'A form label must be associated with a control',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('<input'),
        autoFixable: true,
        suggestion: 'Add aria-label or id attribute'
      });
    }
    
    // متغيرات غير مستخدمة
    const unusedVarMatch = line.match(/const\s+(\w+)\s*=\s*[^;]+;/);
    if (unusedVarMatch) {
      issues.push({
        id: `unused-${filePath}-${lineNumber}`,
        type: 'unused',
        severity: 'medium',
        message: `Remove this useless assignment to variable "${unusedVarMatch[1]}"`,
        file: filePath,
        line: lineNumber,
        column: line.indexOf('const'),
        autoFixable: true,
        suggestion: 'Remove unused variable'
      });
    }
    
    // تعبيرات ثلاثية معقدة
    if (line.includes('?') && line.includes(':') && (line.match(/\?/g) || []).length > 1) {
      issues.push({
        id: `ternary-${filePath}-${lineNumber}`,
        type: 'ternary',
        severity: 'medium',
        message: 'Extract this nested ternary operation into an independent statement',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('?'),
        autoFixable: true,
        suggestion: 'Use if-else statements instead'
      });
    }
    
    // Array index في keys
    if (line.includes('key={index}') || line.includes('key={i}')) {
      issues.push({
        id: `array-key-${filePath}-${lineNumber}`,
        type: 'array-key',
        severity: 'medium',
        message: 'Do not use Array index in keys',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('key='),
        autoFixable: true,
        suggestion: 'Use unique identifier instead of index'
      });
    }
    
    // Optional chain expressions
    if (line.includes('&&') && line.includes('.')) {
      issues.push({
        id: `optional-chain-${filePath}-${lineNumber}`,
        type: 'optional-chain',
        severity: 'medium',
        message: 'Prefer using an optional chain expression instead',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('&&'),
        autoFixable: true,
        suggestion: 'Use ?. instead of &&'
      });
    }
    
    // Promise handling
    if (line.includes('if (') && (line.includes('Promise') || line.includes('fetch'))) {
      issues.push({
        id: `promise-${filePath}-${lineNumber}`,
        type: 'promise',
        severity: 'medium',
        message: 'Expected non-Promise value in a boolean conditional',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('if ('),
        autoFixable: true,
        suggestion: 'Add await or use .then()'
      });
    }
    
    // Regex issues
    if (line.includes('\\\.') || line.includes('\\\+') || line.includes('\\\(') || line.includes('\\\)')) {
      issues.push({
        id: `regex-${filePath}-${lineNumber}`,
        type: 'regex',
        severity: 'medium',
        message: 'Unnecessary escape character',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('\\'),
        autoFixable: true,
        suggestion: 'Remove unnecessary escape characters'
      });
    }
    
    // Template literals معقدة
    if (line.includes('${') && (line.match(/\$\{/g) || []).length > 1) {
      issues.push({
        id: `template-${filePath}-${lineNumber}`,
        type: 'template',
        severity: 'medium',
        message: 'Refactor this code to not use nested template literals',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('${'),
        autoFixable: true,
        suggestion: 'Use separate template literals'
      });
    }
    
    // Case blocks
    if (line.includes('case ') && line.includes(':') && !line.includes('{')) {
      issues.push({
        id: `case-block-${filePath}-${lineNumber}`,
        type: 'case-block',
        severity: 'medium',
        message: 'Unexpected lexical declaration in case block',
        file: filePath,
        line: lineNumber,
        column: line.indexOf('case'),
        autoFixable: true,
        suggestion: 'Add curly braces around case block'
      });
    }
    
    // Redundant assignments
    if (line.includes('=') && line.includes(';')) {
      const assignmentMatch = line.match(/(\w+)\s*=\s*(\w+);/);
      if (assignmentMatch && assignmentMatch[1] === assignmentMatch[2]) {
        issues.push({
          id: `redundant-${filePath}-${lineNumber}`,
          type: 'redundant',
          severity: 'medium',
          message: 'Review this redundant assignment',
          file: filePath,
          line: lineNumber,
          column: line.indexOf('='),
          autoFixable: true,
          suggestion: 'Remove redundant assignment'
        });
      }
    }
    
    // Conditional operations
    if (line.includes('?') && line.includes(':')) {
      const conditionalMatch = line.match(/(\w+)\s*\?\s*(\w+)\s*:\s*\2/);
      if (conditionalMatch) {
        issues.push({
          id: `conditional-${filePath}-${lineNumber}`,
          type: 'conditional',
          severity: 'medium',
          message: 'This conditional operation returns the same value whether the condition is true or false',
          file: filePath,
          line: lineNumber,
          column: line.indexOf('?'),
          autoFixable: true,
          suggestion: 'Simplify conditional operation'
        });
      }
    }
    
    return issues;
  }
  
  // الحصول على جميع المشاكل
  getAllIssues(): Issue[] {
    return this.issues;
  }
  
  // الحصول على إحصائيات المشاكل
  getStats(): IssueStats {
    const stats: IssueStats = {
      total: this.issues.length,
      byType: {},
      bySeverity: {},
      autoFixable: 0,
      manual: 0
    };
    
    this.issues.forEach(issue => {
      // إحصائيات النوع
      stats.byType[issue.type] = (stats.byType[issue.type] || 0) + 1;
      
      // إحصائيات الخطورة
      stats.bySeverity[issue.severity] = (stats.bySeverity[issue.severity] || 0) + 1;
      
      // إحصائيات الإصلاح التلقائي
      if (issue.autoFixable) {
        stats.autoFixable++;
      } else {
        stats.manual++;
      }
    });
    
    return stats;
  }
  
  // إصلاح المشاكل تلقائياً
  fixIssues(filePath: string, code: string): { fixedCode: string; fixedIssues: Issue[] } {
    const fileIssues = this.issues.filter(issue => issue.file === filePath);
    const autoFixableIssues = fileIssues.filter(issue => issue.autoFixable);
    
    let fixedCode = code;
    
    // إصلاح المشاكل تلقائياً
    autoFixableIssues.forEach(issue => {
      fixedCode = this.fixIssue(fixedCode, issue);
    });
    
    return {
      fixedCode,
      fixedIssues: autoFixableIssues
    };
  }
  
  // إصلاح مشكلة واحدة
  private fixIssue(code: string, issue: Issue): string {
    const lines = code.split('\n');
    const lineIndex = issue.line - 1;
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      let line = lines[lineIndex];
      
      switch (issue.type) {
        case 'accessibility':
          if (line.includes('<div onClick') && !line.includes('role=')) {
            line = line.replace('<div onClick', '<div role="button" tabIndex={0} onClick');
          }
          if (line.includes('<input') && !line.includes('aria-label')) {
            const placeholderMatch = line.match(/placeholder="([^"]*)"/);
            if (placeholderMatch) {
              line = line.replace(/placeholder="([^"]*)"/, `placeholder="$1" aria-label="$1"`);
            }
          }
          break;
          
        case 'unused':
          if (line.includes('const ') && line.includes('=')) {
            line = ''; // إزالة السطر
          }
          break;
          
        case 'ternary':
          // تحويل التعبيرات الثلاثية المعقدة إلى if-else
          line = line.replace(
            /(\w+)\s*\?\s*([^:]+)\s*:\s*([^:]+)\s*\?\s*([^:]+)\s*:\s*([^;]+)/g,
            '(() => { if ($1) return $2; else if ($3) return $4; else return $5; })()'
          );
          break;
          
        case 'array-key':
          line = line.replace(/key=\{index\}/g, 'key={`item-${index}`}');
          line = line.replace(/key=\{i\}/g, 'key={`item-${i}`}');
          break;
          
        case 'optional-chain':
          line = line.replace(/(\w+)\s*&&\s*(\w+)\.(\w+)/g, '$1?.$2.$3');
          break;
          
        case 'promise':
          if (line.includes('if (') && (line.includes('Promise') || line.includes('fetch'))) {
            line = line.replace(/if\s*\(\s*(\w+)\s*\)/g, 'if (await $1)');
          }
          break;
          
        case 'regex':
          line = line.replace(/\\\./g, '.');
          line = line.replace(/\\\+/g, '+');
          line = line.replace(/\\\(/g, '(');
          line = line.replace(/\\\)/g, ')');
          break;
          
        case 'template':
          line = line.replace(/\$\{([^}]+)\$\{([^}]+)\}/g, '${$1}${$2}');
          break;
          
        case 'case-block':
          if (line.includes('case ') && line.includes(':') && !line.includes('{')) {
            line = line.replace(/case\s+([^:]+):\s*([^}]+)/g, 'case $1: {\n    $2\n  }');
          }
          break;
          
        case 'redundant':
          line = line.replace(/(\w+)\s*=\s*\1;/g, '');
          break;
          
        case 'conditional':
          line = line.replace(/(\w+)\s*\?\s*(\w+)\s*:\s*\2/g, '$2');
          break;
      }
      
      lines[lineIndex] = line;
    }
    
    return lines.join('\n');
  }
  
  // تصدير التقرير
  exportReport(): string {
    const stats = this.getStats();
    const report = `
# تقرير تحليل المشاكل
# Issue Analysis Report

## الإحصائيات العامة
- **إجمالي المشاكل**: ${stats.total}
- **قابلة للإصلاح التلقائي**: ${stats.autoFixable}
- **تحتاج إصلاح يدوي**: ${stats.manual}

## المشاكل حسب النوع
${Object.entries(stats.byType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## المشاكل حسب الخطورة
${Object.entries(stats.bySeverity).map(([severity, count]) => `- ${severity}: ${count}`).join('\n')}

## تفاصيل المشاكل
${this.issues.map(issue => `
### ${issue.id}
- **النوع**: ${issue.type}
- **الخطورة**: ${issue.severity}
- **الملف**: ${issue.file}
- **السطر**: ${issue.line}
- **الرسالة**: ${issue.message}
- **الاقتراح**: ${issue.suggestion}
- **قابل للإصلاح التلقائي**: ${issue.autoFixable ? 'نعم' : 'لا'}
`).join('\n')}
`;
    
    return report;
  }
  
  // مسح جميع المشاكل
  clear(): void {
    this.issues = [];
  }
}

// دالة مساعدة لتحليل ملف
export function analyzeFile(filePath: string, code: string): Issue[] {
  const analyzer = new IssueAnalyzer();
  return analyzer.analyzeFile(filePath, code);
}

// دالة مساعدة لإصلاح ملف
export function fixFile(filePath: string, code: string): { fixedCode: string; fixedIssues: Issue[] } {
  const analyzer = new IssueAnalyzer();
  analyzer.analyzeFile(filePath, code);
  return analyzer.fixIssues(filePath, code);
}

// دالة مساعدة لتحليل عدة ملفات
export function analyzeFiles(files: { path: string; code: string }[]): Issue[] {
  const analyzer = new IssueAnalyzer();
  
  files.forEach(file => {
    analyzer.analyzeFile(file.path, file.code);
  });
  
  return analyzer.getAllIssues();
}

// دالة مساعدة لإصلاح عدة ملفات
export function fixFiles(files: { path: string; code: string }[]): { path: string; fixedCode: string; fixedIssues: Issue[] }[] {
  const analyzer = new IssueAnalyzer();
  
  // تحليل جميع الملفات أولاً
  files.forEach(file => {
    analyzer.analyzeFile(file.path, file.code);
  });
  
  // إصلاح كل ملف
  return files.map(file => {
    const result = analyzer.fixIssues(file.path, file.code);
    return {
      path: file.path,
      fixedCode: result.fixedCode,
      fixedIssues: result.fixedIssues
    };
  });
}
