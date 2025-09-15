/**
 * Polyfills for browser/node environment compatibility
 * حلول توافق لبيئة المتصفح/النود
 */

// إصلاح مشكلة self is not defined في server-side rendering
if (typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// إصلاح مشكلة window is not defined في server-side rendering
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = global;
}

// إصلاح مشكلة document is not defined في server-side rendering
if (typeof document === 'undefined') {
  // @ts-ignore
  global.document = {};
}

// إصلاح مشكلة globalThis is not defined في بعض البيئات
if (typeof globalThis === 'undefined') {
  // @ts-ignore
  global.globalThis = global;
}

// إصلاح مشكلة navigator is not defined في server-side rendering
if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = {
    userAgent: 'Node.js',
    platform: 'Node.js',
  };
}

// إصلاح مشكلة location is not defined في server-side rendering
if (typeof location === 'undefined') {
  // @ts-ignore
  global.location = {
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

// تصدير فارغ للتأكد من أن الملف يعتبر module
export {};