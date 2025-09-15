/**
 * أداة إصلاح التعبيرات الثلاثية المعقدة
 * Ternary Expressions Fixer
 */

// أنواع التعبيرات الثلاثية المعقدة
export interface TernaryIssue {
  type: 'nested' | 'complex' | 'long' | 'confusing';
  line: number;
  column: number;
  expression: string;
  suggestion: string;
}

// إصلاح التعبيرات الثلاثية المعقدة
export class TernaryFixer {
  
  // تحليل التعبيرات الثلاثية المعقدة
  analyze(code: string): TernaryIssue[] {
    const issues: TernaryIssue[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // فحص التعبيرات الثلاثية المعقدة
      if (this.isComplexTernary(line)) {
        issues.push({
          type: 'nested',
          line: index + 1,
          column: line.indexOf('?'),
          expression: line.trim(),
          suggestion: 'Extract this nested ternary operation into an independent statement'
        });
      }
      
      // فحص التعبيرات الثلاثية الطويلة
      if (this.isLongTernary(line)) {
        issues.push({
          type: 'long',
          line: index + 1,
          column: line.indexOf('?'),
          expression: line.trim(),
          suggestion: 'Break this long ternary expression into multiple lines'
        });
      }
      
      // فحص التعبيرات الثلاثية المربكة
      if (this.isConfusingTernary(line)) {
        issues.push({
          type: 'confusing',
          line: index + 1,
          column: line.indexOf('?'),
          expression: line.trim(),
          suggestion: 'Simplify this confusing ternary expression'
        });
      }
    });
    
    return issues;
  }
  
  // فحص التعبيرات الثلاثية المعقدة
  private isComplexTernary(line: string): boolean {
    const questionMarks = (line.match(/\?/g) || []).length;
    const colons = (line.match(/:/g) || []).length;
    
    return questionMarks > 1 && colons > 1;
  }
  
  // فحص التعبيرات الثلاثية الطويلة
  private isLongTernary(line: string): boolean {
    return line.length > 100 && line.includes('?') && line.includes(':');
  }
  
  // فحص التعبيرات الثلاثية المربكة
  private isConfusingTernary(line: string): boolean {
    // فحص التعبيرات الثلاثية مع عمليات معقدة
    const hasComplexOperations = line.includes('&&') || line.includes('||') || line.includes('!');
    const hasTernary = line.includes('?') && line.includes(':');
    
    return hasComplexOperations && hasTernary;
  }
  
  // إصلاح التعبيرات الثلاثية المعقدة
  fixComplex(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية المعقدة
    fixedCode = fixedCode.replace(
      /(\w+)\s*\?\s*([^:]+)\s*:\s*([^:]+)\s*\?\s*([^:]+)\s*:\s*([^;]+)/g,
      (match, condition, trueValue, falseCondition, falseTrueValue, falseFalseValue) => {
        return `(() => {
      if (${condition}) {
        return ${trueValue};
      } else if (${falseCondition}) {
        return ${falseTrueValue};
      } else {
        return ${falseFalseValue};
      }
    })()`;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية الطويلة
  fixLong(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية الطويلة
    fixedCode = fixedCode.replace(
      /(\w+)\s*\?\s*([^:]+)\s*:\s*([^;]+)/g,
      (match, condition, trueValue, falseValue) => {
        if (match.length > 100) {
          return `(() => {
      if (${condition}) {
        return ${trueValue};
      } else {
        return ${falseValue};
      }
    })()`;
        }
        return match;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية المربكة
  fixConfusing(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية مع عمليات معقدة
    fixedCode = fixedCode.replace(
      /(\w+)\s*&&\s*(\w+)\s*\?\s*([^:]+)\s*:\s*([^;]+)/g,
      (match, condition1, condition2, trueValue, falseValue) => {
        return `(() => {
      if (${condition1} && ${condition2}) {
        return ${trueValue};
      } else {
        return ${falseValue};
      }
    })()`;
      }
    );
    
    fixedCode = fixedCode.replace(
      /(\w+)\s*\|\|\s*(\w+)\s*\?\s*([^:]+)\s*:\s*([^;]+)/g,
      (match, condition1, condition2, trueValue, falseValue) => {
        return `(() => {
      if (${condition1} || ${condition2}) {
        return ${trueValue};
      } else {
        return ${falseValue};
      }
    })()`;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في JSX
  fixJSX(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في JSX
    fixedCode = fixedCode.replace(
      /\{(\w+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}/g,
      (match, condition, trueValue, falseValue) => {
        if (match.length > 50) {
          return `{(() => {
        if (${condition}) {
          return ${trueValue};
        } else {
          return ${falseValue};
        }
      })()}`;
        }
        return match;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في CSS
  fixCSS(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في CSS
    fixedCode = fixedCode.replace(
      /style=\{\{([^}]+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}\}/g,
      (match, condition, trueValue, falseValue) => {
        return `style={(() => {
        if (${condition}) {
          return ${trueValue};
        } else {
          return ${falseValue};
        }
      })()}`;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في Strings
  fixStrings(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في Strings
    fixedCode = fixedCode.replace(
      /`([^`]+)\$\{(\w+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}([^`]+)`/g,
      (match, before, condition, trueValue, falseValue, after) => {
        return `(() => {
        if (${condition}) {
          return \`${before}\${${trueValue}}${after}\`;
        } else {
          return \`${before}\${${falseValue}}${after}\`;
        }
      })()`;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في Arrays
  fixArrays(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في Arrays
    fixedCode = fixedCode.replace(
      /\[([^,]+)\s*\?\s*([^:]+)\s*:\s*([^\]]+)\]/g,
      (match, condition, trueValue, falseValue) => {
        return `(() => {
        if (${condition}) {
          return [${trueValue}];
        } else {
          return [${falseValue}];
        }
      })()`;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في Objects
  fixObjects(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في Objects
    fixedCode = fixedCode.replace(
      /\{([^:]+):\s*(\w+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}/g,
      (match, key, condition, trueValue, falseValue) => {
        return `(() => {
        if (${condition}) {
          return {${key}: ${trueValue}};
        } else {
          return {${key}: ${falseValue}};
        }
      })()`;
      }
    );
    
    return fixedCode;
  }
  
  // إصلاح جميع التعبيرات الثلاثية المعقدة
  fixAll(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية المعقدة
    fixedCode = this.fixComplex(fixedCode);
    fixedCode = this.fixLong(fixedCode);
    fixedCode = this.fixConfusing(fixedCode);
    fixedCode = this.fixJSX(fixedCode);
    fixedCode = this.fixCSS(fixedCode);
    fixedCode = this.fixStrings(fixedCode);
    fixedCode = this.fixArrays(fixedCode);
    fixedCode = this.fixObjects(fixedCode);
    
    return fixedCode;
  }
  
  // إصلاح تعبيرات ثلاثية محددة
  fixSpecific(code: string, issueTypes: string[]): string {
    let fixedCode = code;
    
    if (issueTypes.includes('nested')) {
      fixedCode = this.fixComplex(fixedCode);
    }
    
    if (issueTypes.includes('long')) {
      fixedCode = this.fixLong(fixedCode);
    }
    
    if (issueTypes.includes('confusing')) {
      fixedCode = this.fixConfusing(fixedCode);
    }
    
    if (issueTypes.includes('jsx')) {
      fixedCode = this.fixJSX(fixedCode);
    }
    
    if (issueTypes.includes('css')) {
      fixedCode = this.fixCSS(fixedCode);
    }
    
    if (issueTypes.includes('strings')) {
      fixedCode = this.fixStrings(fixedCode);
    }
    
    if (issueTypes.includes('arrays')) {
      fixedCode = this.fixArrays(fixedCode);
    }
    
    if (issueTypes.includes('objects')) {
      fixedCode = this.fixObjects(fixedCode);
    }
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في React Components
  fixReactComponents(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في React Components
    fixedCode = this.fixJSX(fixedCode);
    fixedCode = this.fixCSS(fixedCode);
    
    return fixedCode;
  }
  
  // إصلاح التعبيرات الثلاثية في Functions
  fixFunctions(code: string): string {
    let fixedCode = code;
    
    // إصلاح التعبيرات الثلاثية في Functions
    fixedCode = this.fixComplex(fixedCode);
    fixedCode = this.fixLong(fixedCode);
    fixedCode = this.fixConfusing(fixedCode);
    
    return fixedCode;
  }
}

// دالة مساعدة لإصلاح التعبيرات الثلاثية المعقدة
export function fixTernaryExpressions(code: string): string {
  const fixer = new TernaryFixer();
  return fixer.fixAll(code);
}

// دالة مساعدة لتحليل التعبيرات الثلاثية المعقدة
export function analyzeTernaryExpressions(code: string): TernaryIssue[] {
  const fixer = new TernaryFixer();
  return fixer.analyze(code);
}

// دالة مساعدة لإصلاح تعبيرات ثلاثية محددة
export function fixSpecificTernaryExpressions(code: string, issueTypes: string[]): string {
  const fixer = new TernaryFixer();
  return fixer.fixSpecific(code, issueTypes);
}
