/**
 * Polyfills for browser/node environment compatibility
 * حلول توافق لبيئة المتصفح/النود
 */

// إصلاح شامل وآمن لجميع مشاكل SSR
try {
  // إصلاح Object.assign بطريقة آمنة ومحسنة
  if (!Object.assign || typeof Object.assign !== 'function') {
    Object.assign = function(target, ...sources) {
      if (target == null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      const to = Object(target);
      for (let source of sources) {
        if (source != null && source !== undefined) {
          for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              to[key] = source[key];
            }
          }
        }
      }
      return to;
    };
  }
  
  // إصلاح Object.keys
  if (!Object.keys || typeof Object.keys !== 'function') {
    Object.keys = function(obj) {
      if (obj == null || obj === undefined) return [];
      const keys = [];
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          keys.push(key);
        }
      }
      return keys;
    };
  }
  
  // إصلاح Object.values
  if (!Object.values || typeof Object.values !== 'function') {
    Object.values = function(obj) {
      if (obj == null || obj === undefined) return [];
      const values = [];
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          values.push(obj[key]);
        }
      }
      return values;
    };
  }
  
} catch (e) {
  // تجاهل أي خطأ في polyfill
  console.warn('Polyfill error:', e);
}

// إصلاح شامل لجميع مشاكل SSR
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.window = global.window || {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: () => {},
    cancelAnimationFrame: () => {},
    getComputedStyle: () => ({}),
    matchMedia: () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
    }
  };
  
  // @ts-ignore
  global.document = global.document || {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    createTextNode: (text) => ({ textContent: text, nodeValue: text }),
    createElement: () => ({
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      style: {},
      textContent: '',
      innerHTML: '',
    }),
    head: {
      appendChild: () => {},
      removeChild: () => {},
    },
    body: {
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
    },
  };
  
  // @ts-ignore - إصلاح navigator بطريقة آمنة
  if (!global.navigator || !global.navigator.userAgent) {
    try {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          platform: 'Win32',
          language: 'ar',
          languages: ['ar', 'en'],
          cookieEnabled: true,
          onLine: true,
          doNotTrack: null,
          maxTouchPoints: 0,
          hardwareConcurrency: 4,
          deviceMemory: 8,
          clipboard: {
            writeText: () => Promise.resolve(),
            readText: () => Promise.resolve('')
          }
        },
        writable: false,
        configurable: true
      });
    } catch (e) {
      // إذا فشل، نحاول طريقة أخرى
      global.navigator = global.navigator || {};
      if (!global.navigator.userAgent) {
        global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      }
    }
  }
  
  // @ts-ignore
  global.location = global.location || {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
  };
}

// إصلاح مشكلة self is not defined في server-side rendering
if (typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// إصلاح مشكلة HTMLElement في server-side rendering
if (typeof HTMLElement === 'undefined') {
  // @ts-ignore
  global.HTMLElement = class HTMLElement {
    addEventListener() {}
    removeEventListener() {}
    appendChild() {}
    removeChild() {}
  };
}

// إصلاح مشكلة ResizeObserver في server-side rendering
if (typeof ResizeObserver === 'undefined') {
  // @ts-ignore
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// إصلاح مشكلة IntersectionObserver في server-side rendering
if (typeof IntersectionObserver === 'undefined') {
  // @ts-ignore
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// إصلاح مشكلة MutationObserver في server-side rendering
if (typeof MutationObserver === 'undefined') {
  // @ts-ignore
  global.MutationObserver = class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

// إصلاح إضافي للتأكد من وجود MutationObserver
if (typeof global !== 'undefined' && !global.MutationObserver) {
  // @ts-ignore
  global.MutationObserver = class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

// إصلاح مشكلة globalThis is not defined في بعض البيئات
if (typeof globalThis === 'undefined') {
  // @ts-ignore
  global.globalThis = global;
}


// إصلاح مشكلة vendor object في Next.js DevTools
if (typeof global !== 'undefined' && global.navigator && !global.navigator.vendor) {
  try {
    global.navigator.vendor = 'Google Inc.';
    global.navigator.vendorSub = '';
    global.navigator.productSub = '20030107';
    global.navigator.product = 'Gecko';
  } catch (e) {
    // تجاهل الخطأ إذا كان readonly
  }
}


// إصلاح مشكلة webpack require
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.__webpack_require__ = global.__webpack_require__ || function(id) {
    return {};
  };
  
  // @ts-ignore
  global.__webpack_require__.cache = global.__webpack_require__.cache || {};
  
  // @ts-ignore
  global.__webpack_require__.modules = global.__webpack_require__.modules || {};
}

// إصلاح مشكلة module.exports
if (typeof module === 'undefined') {
  // @ts-ignore
  global.module = { exports: {} };
}

// إصلاح مشكلة exports
if (typeof exports === 'undefined') {
  // @ts-ignore
  global.exports = {};
}

// تصدير فارغ للتأكد من أن الملف يعتبر module
export {};