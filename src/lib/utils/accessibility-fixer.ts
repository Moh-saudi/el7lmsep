/**
 * أداة إصلاح مشاكل إمكانية الوصول
 * Accessibility Issues Fixer
 */

// أنواع مشاكل إمكانية الوصول
export interface AccessibilityIssue {
  type: 'missing-label' | 'missing-role' | 'missing-tabindex' | 'missing-alt' | 'missing-aria';
  element: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
}

// إصلاح مشاكل إمكانية الوصول
export class AccessibilityFixer {
  
  // إصلاح النماذج
  fixForms(code: string): string {
    // إضافة labels للنماذج
    code = code.replace(
      /<input\s+type="(text|email|password|tel|number)"(?![^>]*(?:aria-label|id=))/g,
      (match, type) => {
        const placeholder = match.match(/placeholder="([^"]*)"/)?.[1];
        if (placeholder) {
          return match.replace(/placeholder="([^"]*)"/, `placeholder="$1" aria-label="$1"`);
        }
        return match;
      }
    );
    
    // إضافة labels للـ textareas
    code = code.replace(
      /<textarea(?![^>]*(?:aria-label|id=))/g,
      (match) => {
        const placeholder = match.match(/placeholder="([^"]*)"/)?.[1];
        if (placeholder) {
          return match.replace(/placeholder="([^"]*)"/, `placeholder="$1" aria-label="$1"`);
        }
        return match;
      }
    );
    
    // إضافة labels للـ selects
    code = code.replace(
      /<select(?![^>]*(?:aria-label|id=))/g,
      (match) => {
        return match + ' aria-label="اختر من القائمة"';
      }
    );
    
    return code;
  }
  
  // إصلاح العناصر التفاعلية
  fixInteractiveElements(code: string): string {
    // إضافة role للعناصر غير الأصلية
    code = code.replace(
      /<div\s+onClick/g,
      '<div role="button" tabIndex={0} onClick'
    );
    
    code = code.replace(
      /<span\s+onClick/g,
      '<span role="button" tabIndex={0} onClick'
    );
    
    code = code.replace(
      /<p\s+onClick/g,
      '<p role="button" tabIndex={0} onClick'
    );
    
    // إضافة role للعناصر القابلة للنقر
    code = code.replace(
      /<div\s+onClick/g,
      '<div role="button" tabIndex={0} onClick'
    );
    
    return code;
  }
  
  // إصلاح الصور
  fixImages(code: string): string {
    // إضافة alt للصور
    code = code.replace(
      /<img(?![^>]*alt=)/g,
      (match) => {
        const src = match.match(/src="([^"]*)"/)?.[1];
        if (src) {
          const altText = src.split('/').pop()?.split('.')[0] || 'صورة';
          return match + ` alt="${altText}"`;
        }
        return match + ' alt="صورة"';
      }
    );
    
    return code;
  }
  
  // إصلاح الروابط
  fixLinks(code: string): string {
    // إضافة aria-label للروابط
    code = code.replace(
      /<a\s+href(?![^>]*aria-label)/g,
      (match) => {
        const href = match.match(/href="([^"]*)"/)?.[1];
        if (href) {
          return match + ` aria-label="رابط إلى ${href}"`;
        }
        return match;
      }
    );
    
    return code;
  }
  
  // إصلاح الأزرار
  fixButtons(code: string): string {
    // إضافة aria-label للأزرار
    code = code.replace(
      /<button(?![^>]*aria-label)/g,
      (match) => {
        const text = match.match(/>([^<]+)</)?.[1];
        if (text) {
          return match.replace(/>([^<]+)</, ` aria-label="$1">$1<`);
        }
        return match;
      }
    );
    
    return code;
  }
  
  // إصلاح القوائم
  fixLists(code: string): string {
    // إضافة role للقوائم
    code = code.replace(
      /<ul(?![^>]*role=)/g,
      '<ul role="list"'
    );
    
    code = code.replace(
      /<ol(?![^>]*role=)/g,
      '<ol role="list"'
    );
    
    return code;
  }
  
  // إصلاح الجداول
  fixTables(code: string): string {
    // إضافة role للجداول
    code = code.replace(
      /<table(?![^>]*role=)/g,
      '<table role="table"'
    );
    
    // إضافة role للرؤوس
    code = code.replace(
      /<th(?![^>]*role=)/g,
      '<th role="columnheader"'
    );
    
    // إضافة role للخلايا
    code = code.replace(
      /<td(?![^>]*role=)/g,
      '<td role="cell"'
    );
    
    return code;
  }
  
  // إصلاح النماذج المعقدة
  fixComplexForms(code: string): string {
    // إضافة fieldset للعناصر المرتبطة
    code = code.replace(
      /<div\s+class="[^"]*form-group[^"]*">\s*<label[^>]*>([^<]+)<\/label>\s*<input/g,
      '<fieldset><legend>$1</legend><input'
    );
    
    // إضافة aria-describedby للأخطاء
    code = code.replace(
      /<input([^>]*)\/>\s*<div\s+class="[^"]*error[^"]*">([^<]+)<\/div>/g,
      '<input$1 aria-describedby="error-$1"/><div class="error" id="error-$1">$2</div>'
    );
    
    return code;
  }
  
  // إصلاح العناصر المخفية
  fixHiddenElements(code: string): string {
    // إضافة aria-hidden للعناصر الزخرفية
    code = code.replace(
      /<div\s+class="[^"]*decoration[^"]*"/g,
      '<div class="decoration" aria-hidden="true"'
    );
    
    code = code.replace(
      /<span\s+class="[^"]*icon[^"]*"/g,
      '<span class="icon" aria-hidden="true"'
    );
    
    return code;
  }
  
  // إصلاح العناصر التفاعلية المعقدة
  fixComplexInteractive(code: string): string {
    // إضافة aria-expanded للقوائم المنسدلة
    code = code.replace(
      /<div\s+class="[^"]*dropdown[^"]*"/g,
      '<div class="dropdown" aria-expanded="false"'
    );
    
    // إضافة aria-selected للعناصر المحددة
    code = code.replace(
      /<div\s+class="[^"]*selected[^"]*"/g,
      '<div class="selected" aria-selected="true"'
    );
    
    // إضافة aria-checked للعناصر المحددة
    code = code.replace(
      /<div\s+class="[^"]*checked[^"]*"/g,
      '<div class="checked" aria-checked="true"'
    );
    
    return code;
  }
  
  // إصلاح جميع مشاكل إمكانية الوصول
  fixAll(code: string): string {
    let fixedCode = code;
    
    fixedCode = this.fixForms(fixedCode);
    fixedCode = this.fixInteractiveElements(fixedCode);
    fixedCode = this.fixImages(fixedCode);
    fixedCode = this.fixLinks(fixedCode);
    fixedCode = this.fixButtons(fixedCode);
    fixedCode = this.fixLists(fixedCode);
    fixedCode = this.fixTables(fixedCode);
    fixedCode = this.fixComplexForms(fixedCode);
    fixedCode = this.fixHiddenElements(fixedCode);
    fixedCode = this.fixComplexInteractive(fixedCode);
    
    return fixedCode;
  }
  
  // تحليل مشاكل إمكانية الوصول
  analyze(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // فحص النماذج
      if (line.includes('<input') && !line.includes('aria-label') && !line.includes('id=')) {
        issues.push({
          type: 'missing-label',
          element: 'input',
          line: index + 1,
          column: line.indexOf('<input'),
          message: 'A form label must be associated with a control',
          suggestion: 'Add aria-label or id attribute'
        });
      }
      
      // فحص العناصر التفاعلية
      if (line.includes('<div onClick') && !line.includes('role=')) {
        issues.push({
          type: 'missing-role',
          element: 'div',
          line: index + 1,
          column: line.indexOf('<div onClick'),
          message: 'Avoid non-native interactive elements',
          suggestion: 'Add role="button" and tabIndex={0}'
        });
      }
      
      // فحص الصور
      if (line.includes('<img') && !line.includes('alt=')) {
        issues.push({
          type: 'missing-alt',
          element: 'img',
          line: index + 1,
          column: line.indexOf('<img'),
          message: 'Images must have alt text',
          suggestion: 'Add alt attribute'
        });
      }
      
      // فحص الروابط
      if (line.includes('<a href') && !line.includes('aria-label')) {
        issues.push({
          type: 'missing-aria',
          element: 'a',
          line: index + 1,
          column: line.indexOf('<a href'),
          message: 'Links should have descriptive text',
          suggestion: 'Add aria-label or descriptive text'
        });
      }
    });
    
    return issues;
  }
  
  // إصلاح مشاكل محددة
  fixSpecific(code: string, issueTypes: string[]): string {
    let fixedCode = code;
    
    if (issueTypes.includes('missing-label')) {
      fixedCode = this.fixForms(fixedCode);
    }
    
    if (issueTypes.includes('missing-role')) {
      fixedCode = this.fixInteractiveElements(fixedCode);
    }
    
    if (issueTypes.includes('missing-alt')) {
      fixedCode = this.fixImages(fixedCode);
    }
    
    if (issueTypes.includes('missing-aria')) {
      fixedCode = this.fixLinks(fixedCode);
      fixedCode = this.fixButtons(fixedCode);
    }
    
    return fixedCode;
  }
}

// دالة مساعدة لإصلاح مشاكل إمكانية الوصول
export function fixAccessibility(code: string): string {
  const fixer = new AccessibilityFixer();
  return fixer.fixAll(code);
}

// دالة مساعدة لتحليل مشاكل إمكانية الوصول
export function analyzeAccessibility(code: string): AccessibilityIssue[] {
  const fixer = new AccessibilityFixer();
  return fixer.analyze(code);
}

// دالة مساعدة لإصلاح مشاكل محددة
export function fixSpecificAccessibility(code: string, issueTypes: string[]): string {
  const fixer = new AccessibilityFixer();
  return fixer.fixSpecific(code, issueTypes);
}
