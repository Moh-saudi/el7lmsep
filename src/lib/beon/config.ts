/**
 * BeOn V3 API Configuration
 * تكوين API BeOn V3
 */

import { BEON_V3_CONFIG } from "../config";

// Export individual config values for backward compatibility
export const BEON_BASE_URL = BEON_V3_CONFIG.BASE_URL;
export const BEON_TOKEN = BEON_V3_CONFIG.TOKEN;
export const BEON_SENDER_NAME = BEON_V3_CONFIG.SENDER_NAME;

/**
 * Create BeOn API headers
 */
export function createBeOnHeaders(token?: string) {
  const authToken = token || BEON_TOKEN;
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Create BeOn API headers for form data
 */
export function createBeOnFormHeaders(token?: string) {
  const authToken = token || BEON_TOKEN;
  return {
    'Authorization': `Bearer ${authToken}`,
    'Accept': 'application/json',
  };
}

// Types for BeOn API
export interface BeOnResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  data?: any;
  retryAfter?: number;
}

export interface SMSBulkRequest {
  phoneNumbers: string[];
  message: string;
}

export interface WhatsAppBulkRequest {
  phoneNumbers: string[];
  message: string;
}
