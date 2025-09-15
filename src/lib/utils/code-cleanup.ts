/**
 * أدوات تنظيف الكود التلقائي
 * Automatic Code Cleanup Utilities
 */

// أنواع المشاكل
export interface CodeIssue {
  type: 'accessibility' | 'unused' | 'ternary' | 'array-key' | 'optional-chain' | 'promise' | 'regex';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

// إصلاح مشاكل إمكانية الوصول
export function fixAccessibilityIssues(code: string): string {
  // إضافة aria-label للعناصر التفاعلية
  code = code.replace(
    /<div\s+onClick/g,
    '<div role="button" tabIndex={0} onClick'
  );
  
  // إضافة labels للنماذج
  code = code.replace(
    /<input\s+type="(text|email|password|tel)"(?![^>]*aria-label)/g,
    (match, type) => {
      const placeholder = match.match(/placeholder="([^"]*)"/)?.[1];
      if (placeholder) {
        return match.replace(/placeholder="([^"]*)"/, `placeholder="$1" aria-label="$1"`);
      }
      return match;
    }
  );
  
  // إضافة role للعناصر غير الأصلية
  code = code.replace(
    /<span\s+onClick/g,
    '<span role="button" tabIndex={0} onClick'
  );
  
  return code;
}

// إزالة المتغيرات غير المستخدمة
export function removeUnusedVariables(code: string): string {
  // إزالة المتغيرات المعرفة ولكن غير المستخدمة
  const unusedPatterns = [
    // const unused = ...;
    /const\s+(\w+)\s*=\s*[^;]+;\s*(?=\n|$)/g,
    // let unused = ...;
    /let\s+(\w+)\s*=\s*[^;]+;\s*(?=\n|$)/g,
    // var unused = ...;
    /var\s+(\w+)\s*=\s*[^;]+;\s*(?=\n|$)/g
  ];
  
  unusedPatterns.forEach(pattern => {
    code = code.replace(pattern, (match, varName) => {
      // التحقق من استخدام المتغير في باقي الكود
      const remainingCode = code.replace(match, '');
      if (!remainingCode.includes(varName)) {
        return ''; // إزالة المتغير غير المستخدم
      }
      return match; // الاحتفاظ بالمتغير المستخدم
    });
  });
  
  return code;
}

// تبسيط التعبيرات الثلاثية المعقدة
export function simplifyTernaryExpressions(code: string): string {
  // استخراج التعبيرات الثلاثية المعقدة
  const complexTernaryPattern = /(\w+)\s*\?\s*([^:]+)\s*:\s*([^:]+)\s*\?\s*([^:]+)\s*:\s*([^;]+)/g;
  
  code = code.replace(complexTernaryPattern, (match, condition, trueValue, falseCondition, falseTrueValue, falseFalseValue) => {
    // تحويل إلى if-else statements
    return `(() => {
      if (${condition}) {
        return ${trueValue};
      } else if (${falseCondition}) {
        return ${falseTrueValue};
      } else {
        return ${falseFalseValue};
      }
    })()`;
  });
  
  return code;
}

// إصلاح Array Index في Keys
export function fixArrayKeys(code: string): string {
  // استبدال key={index} بـ key أكثر وضوحاً
  code = code.replace(
    /key=\{(\w+)\}/g,
    (match, indexVar) => {
      if (indexVar === 'index' || indexVar === 'i') {
        return `key={\`item-\${${indexVar}}\`}`;
      }
      return match;
    }
  );
  
  // إضافة key فريد للمصفوفات
  code = code.replace(
    /\.map\(\(([^,]+),\s*(\w+)\)\s*=>/g,
    (match, item, index) => {
      return `.map((${item}, ${index}) =>`;
    }
  );
  
  return code;
}

// إصلاح Optional Chain Expressions
export function fixOptionalChains(code: string): string {
  // استبدال && بـ ?.
  code = code.replace(
    /(\w+)\s*&&\s*(\w+)\.(\w+)/g,
    '$1?.$2.$3'
  );
  
  // استبدال nested && بـ ?.
  code = code.replace(
    /(\w+)\s*&&\s*(\w+)\s*&&\s*(\w+)\.(\w+)/g,
    '$1?.$2?.$3.$4'
  );
  
  return code;
}

// إصلاح Promise Handling
export function fixPromiseHandling(code: string): string {
  // إضافة await للـ Promises
  code = code.replace(
    /if\s*\(\s*(\w+)\s*\)/g,
    (match, promiseVar) => {
      if (promiseVar.includes('Promise') || promiseVar.includes('fetch')) {
        return `if (await ${promiseVar})`;
      }
      return match;
    }
  );
  
  // إصلاح boolean conditions للـ Promises
  code = code.replace(
    /if\s*\(\s*(\w+)\s*\)\s*{/g,
    (match, promiseVar) => {
      if (promiseVar.includes('Promise') || promiseVar.includes('fetch')) {
        return `if (await ${promiseVar}) {`;
      }
      return match;
    }
  );
  
  return code;
}

// إصلاح Regex Issues
export function fixRegexIssues(code: string): string {
  // إزالة escape characters غير ضرورية
  code = code.replace(/\\\./g, '.');
  code = code.replace(/\\\+/g, '+');
  code = code.replace(/\\\(/g, '(');
  code = code.replace(/\\\)/g, ')');
  
  // استبدال character classes بـ single characters
  code = code.replace(/\[\.\]/g, '.');
  code = code.replace(/\[\\\.\]/g, '.');
  
  return code;
}

// إصلاح Template Literals المعقدة
export function fixTemplateLiterals(code: string): string {
  // استخراج template literals معقدة
  const complexTemplatePattern = /\$\{([^}]+)\$\{([^}]+)\}/g;
  
  code = code.replace(complexTemplatePattern, (match, outer, inner) => {
    return `\${${outer}}\${${inner}}`;
  });
  
  return code;
}

// إصلاح Case Blocks
export function fixCaseBlocks(code: string): string {
  // إضافة curly braces للـ case blocks
  code = code.replace(
    /case\s+([^:]+):\s*([^}]+)(?=\s*case|\s*default|\s*})/g,
    (match, caseValue, caseBody) => {
      if (!caseBody.trim().startsWith('{')) {
        return `case ${caseValue}: {\n    ${caseBody.trim()}\n  }`;
      }
      return match;
    }
  );
  
  return code;
}

// إصلاح Redundant Assignments
export function fixRedundantAssignments(code: string): string {
  // إزالة التكرار في التخصيصات
  code = code.replace(
    /(\w+)\s*=\s*(\w+);\s*\n\s*\1\s*=\s*\2;/g,
    '$1 = $2;'
  );
  
  return code;
}

// إصلاح Conditional Operations
export function fixConditionalOperations(code: string): string {
  // إصلاح العمليات الشرطية التي تعيد نفس القيمة
  code = code.replace(
    /(\w+)\s*\?\s*(\w+)\s*:\s*\2/g,
    '$2'
  );
  
  return code;
}

// الدالة الرئيسية للتنظيف
export function cleanupCode(code: string, options: {
  fixAccessibility?: boolean;
  removeUnused?: boolean;
  simplifyTernary?: boolean;
  fixArrayKeys?: boolean;
  fixOptionalChains?: boolean;
  fixPromises?: boolean;
  fixRegex?: boolean;
  fixTemplates?: boolean;
  fixCaseBlocks?: boolean;
  fixRedundant?: boolean;
  fixConditionals?: boolean;
} = {}): string {
  let cleanedCode = code;
  
  if (options.fixAccessibility !== false) {
    cleanedCode = fixAccessibilityIssues(cleanedCode);
  }
  
  if (options.removeUnused !== false) {
    cleanedCode = removeUnusedVariables(cleanedCode);
  }
  
  if (options.simplifyTernary !== false) {
    cleanedCode = simplifyTernaryExpressions(cleanedCode);
  }
  
  if (options.fixArrayKeys !== false) {
    cleanedCode = fixArrayKeys(cleanedCode);
  }
  
  if (options.fixOptionalChains !== false) {
    cleanedCode = fixOptionalChains(cleanedCode);
  }
  
  if (options.fixPromises !== false) {
    cleanedCode = fixPromiseHandling(cleanedCode);
  }
  
  if (options.fixRegex !== false) {
    cleanedCode = fixRegexIssues(cleanedCode);
  }
  
  if (options.fixTemplates !== false) {
    cleanedCode = fixTemplateLiterals(cleanedCode);
  }
  
  if (options.fixCaseBlocks !== false) {
    cleanedCode = fixCaseBlocks(cleanedCode);
  }
  
  if (options.fixRedundant !== false) {
    cleanedCode = fixRedundantAssignments(cleanedCode);
  }
  
  if (options.fixConditionals !== false) {
    cleanedCode = fixConditionalOperations(cleanedCode);
  }
  
  return cleanedCode;
}

// إصلاح مشاكل محددة
export function fixSpecificIssues(code: string, issueTypes: string[]): string {
  const options: any = {};
  
  issueTypes.forEach(type => {
    switch (type) {
      case 'accessibility':
        options.fixAccessibility = true;
        break;
      case 'unused':
        options.removeUnused = true;
        break;
      case 'ternary':
        options.simplifyTernary = true;
        break;
      case 'array-key':
        options.fixArrayKeys = true;
        break;
      case 'optional-chain':
        options.fixOptionalChains = true;
        break;
      case 'promise':
        options.fixPromises = true;
        break;
      case 'regex':
        options.fixRegex = true;
        break;
      case 'template':
        options.fixTemplates = true;
        break;
      case 'case-block':
        options.fixCaseBlocks = true;
        break;
      case 'redundant':
        options.fixRedundant = true;
        break;
      case 'conditional':
        options.fixConditionals = true;
        break;
    }
  });
  
  return cleanupCode(code, options);
}

// إصلاح جميع المشاكل
export function fixAllIssues(code: string): string {
  return cleanupCode(code, {
    fixAccessibility: true,
    removeUnused: true,
    simplifyTernary: true,
    fixArrayKeys: true,
    fixOptionalChains: true,
    fixPromises: true,
    fixRegex: true,
    fixTemplates: true,
    fixCaseBlocks: true,
    fixRedundant: true,
    fixConditionals: true
  });
}
