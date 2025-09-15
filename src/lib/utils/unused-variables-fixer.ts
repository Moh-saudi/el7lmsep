/**
 * أداة إصلاح المتغيرات غير المستخدمة
 * Unused Variables Fixer
 */

// أنواع المتغيرات غير المستخدمة
export interface UnusedVariable {
  name: string;
  type: 'const' | 'let' | 'var';
  line: number;
  column: number;
  value: string;
  isUsed: boolean;
}

// إصلاح المتغيرات غير المستخدمة
export class UnusedVariablesFixer {
  
  // تحليل المتغيرات غير المستخدمة
  analyze(code: string): UnusedVariable[] {
    const unusedVars: UnusedVariable[] = [];
    const lines = code.split('\n');
    
    // البحث عن جميع المتغيرات
    const allVariables: UnusedVariable[] = [];
    
    lines.forEach((line, index) => {
      // const variables
      const constMatch = line.match(/const\s+(\w+)\s*=\s*([^;]+);/);
      if (constMatch) {
        allVariables.push({
          name: constMatch[1],
          type: 'const',
          line: index + 1,
          column: line.indexOf('const'),
          value: constMatch[2],
          isUsed: false
        });
      }
      
      // let variables
      const letMatch = line.match(/let\s+(\w+)\s*=\s*([^;]+);/);
      if (letMatch) {
        allVariables.push({
          name: letMatch[1],
          type: 'let',
          line: index + 1,
          column: line.indexOf('let'),
          value: letMatch[2],
          isUsed: false
        });
      }
      
      // var variables
      const varMatch = line.match(/var\s+(\w+)\s*=\s*([^;]+);/);
      if (varMatch) {
        allVariables.push({
          name: varMatch[1],
          type: 'var',
          line: index + 1,
          column: line.indexOf('var'),
          value: varMatch[2],
          isUsed: false
        });
      }
    });
    
    // فحص استخدام كل متغير
    allVariables.forEach(variable => {
      const isUsed = this.isVariableUsed(code, variable.name, variable.line);
      if (!isUsed) {
        unusedVars.push(variable);
      }
    });
    
    return unusedVars;
  }
  
  // فحص استخدام متغير
  private isVariableUsed(code: string, variableName: string, declarationLine: number): boolean {
    const lines = code.split('\n');
    
    // البحث في جميع الأسطر بعد تعريف المتغير
    for (let i = declarationLine; i < lines.length; i++) {
      const line = lines[i];
      
      // تخطي السطر الذي يحتوي على تعريف المتغير
      if (i === declarationLine - 1) {
        continue;
      }
      
      // البحث عن استخدام المتغير
      if (this.isVariableUsedInLine(line, variableName)) {
        return true;
      }
    }
    
    return false;
  }
  
  // فحص استخدام متغير في سطر واحد
  private isVariableUsedInLine(line: string, variableName: string): boolean {
    // البحث عن المتغير في السطر
    const regex = new RegExp(`\\b${variableName}\\b`, 'g');
    const matches = line.match(regex);
    
    if (matches) {
      // فحص أن الاستخدام ليس تعريف جديد
      const isDeclaration = line.includes(`${variableName} =`) || 
                           line.includes(`const ${variableName}`) ||
                           line.includes(`let ${variableName}`) ||
                           line.includes(`var ${variableName}`);
      
      if (!isDeclaration) {
        return true;
      }
    }
    
    return false;
  }
  
  // إزالة المتغيرات غير المستخدمة
  removeUnused(code: string): string {
    const unusedVars = this.analyze(code);
    let fixedCode = code;
    
    // إزالة المتغيرات غير المستخدمة
    unusedVars.forEach(variable => {
      const lines = fixedCode.split('\n');
      const lineIndex = variable.line - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // إزالة السطر الذي يحتوي على المتغير غير المستخدم
        if (line.includes(`${variable.type} ${variable.name}`)) {
          lines[lineIndex] = '';
        }
      }
      
      fixedCode = lines.join('\n');
    });
    
    // إزالة الأسطر الفارغة
    fixedCode = fixedCode.replace(/^\s*$/gm, '');
    
    return fixedCode;
  }
  
  // إصلاح المتغيرات غير المستخدمة بطريقة ذكية
  fixSmart(code: string): string {
    const unusedVars = this.analyze(code);
    let fixedCode = code;
    
    unusedVars.forEach(variable => {
      const lines = fixedCode.split('\n');
      const lineIndex = variable.line - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // إزالة المتغير غير المستخدم
        if (line.includes(`${variable.type} ${variable.name}`)) {
          // إزالة السطر بالكامل إذا كان يحتوي على متغير واحد فقط
          if (line.trim().endsWith(';') && line.split(',').length === 1) {
            lines[lineIndex] = '';
          } else {
            // إزالة المتغير من السطر إذا كان هناك متغيرات أخرى
            const newLine = line.replace(/,?\s*${variable.type}\s+${variable.name}\s*=\s*[^;]+;?/g, '');
            lines[lineIndex] = newLine;
          }
        }
      }
      
      fixedCode = lines.join('\n');
    });
    
    // تنظيف الكود
    fixedCode = this.cleanupCode(fixedCode);
    
    return fixedCode;
  }
  
  // تنظيف الكود
  private cleanupCode(code: string): string {
    // إزالة الأسطر الفارغة المتعددة
    code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // إزالة المسافات الزائدة
    code = code.replace(/^\s+$/gm, '');
    
    // إزالة الفواصل الزائدة
    code = code.replace(/,\s*,/g, ',');
    code = code.replace(/,\s*}/g, '}');
    code = code.replace(/,\s*]/g, ']');
    
    return code;
  }
  
  // إصلاح المتغيرات غير المستخدمة في React Components
  fixReactComponents(code: string): string {
    const unusedVars = this.analyze(code);
    let fixedCode = code;
    
    unusedVars.forEach(variable => {
      // تخطي المتغيرات المهمة في React
      if (this.isImportantReactVariable(variable.name)) {
        return;
      }
      
      const lines = fixedCode.split('\n');
      const lineIndex = variable.line - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // إزالة المتغير غير المستخدم
        if (line.includes(`${variable.type} ${variable.name}`)) {
          lines[lineIndex] = '';
        }
      }
      
      fixedCode = lines.join('\n');
    });
    
    return fixedCode;
  }
  
  // فحص المتغيرات المهمة في React
  private isImportantReactVariable(variableName: string): boolean {
    const importantVars = [
      'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo',
      'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
      'React', 'Component', 'PureComponent', 'Fragment', 'StrictMode',
      'createElement', 'cloneElement', 'isValidElement', 'Children',
      'useState', 'setState', 'props', 'state', 'ref', 'key'
    ];
    
    return importantVars.includes(variableName);
  }
  
  // إصلاح المتغيرات غير المستخدمة في Functions
  fixFunctions(code: string): string {
    const unusedVars = this.analyze(code);
    let fixedCode = code;
    
    unusedVars.forEach(variable => {
      // تخطي المتغيرات المهمة في Functions
      if (this.isImportantFunctionVariable(variable.name)) {
        return;
      }
      
      const lines = fixedCode.split('\n');
      const lineIndex = variable.line - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // إزالة المتغير غير المستخدم
        if (line.includes(`${variable.type} ${variable.name}`)) {
          lines[lineIndex] = '';
        }
      }
      
      fixedCode = lines.join('\n');
    });
    
    return fixedCode;
  }
  
  // فحص المتغيرات المهمة في Functions
  private isImportantFunctionVariable(variableName: string): boolean {
    const importantVars = [
      'return', 'throw', 'try', 'catch', 'finally', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'function', 'async',
      'await', 'Promise', 'resolve', 'reject', 'then', 'catch', 'finally'
    ];
    
    return importantVars.includes(variableName);
  }
  
  // إصلاح جميع المتغيرات غير المستخدمة
  fixAll(code: string): string {
    let fixedCode = code;
    
    // إصلاح المتغيرات غير المستخدمة
    fixedCode = this.removeUnused(fixedCode);
    
    // تنظيف الكود
    fixedCode = this.cleanupCode(fixedCode);
    
    return fixedCode;
  }
  
  // إصلاح متغيرات محددة
  fixSpecific(code: string, variableNames: string[]): string {
    const unusedVars = this.analyze(code);
    let fixedCode = code;
    
    unusedVars.forEach(variable => {
      if (variableNames.includes(variable.name)) {
        const lines = fixedCode.split('\n');
        const lineIndex = variable.line - 1;
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];
          
          // إزالة المتغير غير المستخدم
          if (line.includes(`${variable.type} ${variable.name}`)) {
            lines[lineIndex] = '';
          }
        }
        
        fixedCode = lines.join('\n');
      }
    });
    
    return fixedCode;
  }
}

// دالة مساعدة لإصلاح المتغيرات غير المستخدمة
export function fixUnusedVariables(code: string): string {
  const fixer = new UnusedVariablesFixer();
  return fixer.fixAll(code);
}

// دالة مساعدة لتحليل المتغيرات غير المستخدمة
export function analyzeUnusedVariables(code: string): UnusedVariable[] {
  const fixer = new UnusedVariablesFixer();
  return fixer.analyze(code);
}

// دالة مساعدة لإصلاح متغيرات محددة
export function fixSpecificUnusedVariables(code: string, variableNames: string[]): string {
  const fixer = new UnusedVariablesFixer();
  return fixer.fixSpecific(code, variableNames);
}
