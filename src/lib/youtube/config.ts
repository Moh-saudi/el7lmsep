/**
 * YouTube API Configuration
 * تكوين YouTube API
 */

import { CONFIG } from "../config";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

let cachedKey: string | null | undefined;

export async function getYouTubeApiKey(): Promise<string | null> {
  if (typeof cachedKey !== 'undefined') return cachedKey;

  // Prefer environment variable
  const envKey = CONFIG.youtube.API_KEY?.trim();
  if (envKey) {
    cachedKey = envKey;
    return envKey;
  }

  // Fallback to Firestore
  try {
    const configDoc = await getDoc(doc(db, 'config', 'youtube'));
    if (configDoc.exists()) {
      const data = configDoc.data();
      cachedKey = data.apiKey || null;
      return cachedKey;
    }
  } catch (error) {
    console.error('Error fetching YouTube API key from Firestore:', error);
  }

  cachedKey = null;
  return null;
}

export const YOUTUBE_CONFIG = CONFIG.youtube;
