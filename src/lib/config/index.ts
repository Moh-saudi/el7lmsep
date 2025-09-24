/**
 * Unified Configuration File
 * ملف التكوين الموحد
 * 
 * This file contains all configuration for the application
 * هذا الملف يحتوي على جميع إعدادات التطبيق
 */

// Azure Configuration
export const AZURE_CONFIG = {
  CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'images',
  ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
  ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
};

// BeOn V3 API Configuration
export const BEON_V3_CONFIG = {
  BASE_URL: process.env.BEON_V3_BASE_URL || 'https://v3.api.beon.chat',
  TOKEN: process.env.BEON_V3_TOKEN,
  SENDER_NAME: process.env.BEON_SENDER_NAME || 'El7lm',
  ENDPOINTS: {
    SMS_BULK: '/sms/bulk',
    SMS_TEMPLATE: '/sms/template',
    WHATSAPP_BULK: '/whatsapp/bulk',
    WHATSAPP_TEMPLATE: '/whatsapp/template',
    ACCOUNT_DETAILS: '/account/details',
  },
};

// EmailJS Configuration
export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// YouTube API Configuration
export const YOUTUBE_CONFIG = {
  API_KEY: process.env.YOUTUBE_API_KEY || '',
  BASE_URL: 'https://www.googleapis.com/youtube/v3',
};

// Unified Configuration Object
export const CONFIG = {
  azure: AZURE_CONFIG,
  beon: BEON_V3_CONFIG,
  emailjs: EMAILJS_CONFIG,
  firebase: FIREBASE_CONFIG,
  youtube: YOUTUBE_CONFIG,
};

// Export individual configs for backward compatibility
export {
  AZURE_CONFIG as AZURE,
  BEON_V3_CONFIG as BEON,
  EMAILJS_CONFIG as EMAILJS,
  FIREBASE_CONFIG as FIREBASE,
  YOUTUBE_CONFIG as YOUTUBE,
};
