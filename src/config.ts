/**
 * Google Apps Script Web App Configuration
 * This URL can be set via Environment variable (VITE_APPS_SCRIPT_URL)
 * or updated interactively by the user in the UI, stored in localStorage.
 */

export const STORAGE_KEY_SCRIPT_URL = 'booth_amf_apps_script_url';
export const STORAGE_KEY_AUTO_REFRESH = 'booth_amf_auto_refresh_sec';

// Default / fallback Apps Script URL provided by user
export const DEFAULT_APPS_SCRIPT_URL = 
  (import.meta.env.VITE_APPS_SCRIPT_URL as string) || 
  'https://script.google.com/macros/s/AKfycbwv8p_TAKFG9ddPMUzUvR47Q1nhdDEOrvxh_j9v0H7Obq-rvZh9GoPXYZ5A7eCynmQ/exec';

export function getAppsScriptUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_APPS_SCRIPT_URL;
  const stored = localStorage.getItem(STORAGE_KEY_SCRIPT_URL);
  // Return stored URL if it exists, otherwise default to the user's deployed URL
  if (stored && stored.trim()) return stored.trim();
  return DEFAULT_APPS_SCRIPT_URL;
}

export function setAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SCRIPT_URL, url.trim());
}

export function isValidAppsScriptUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith('https://script.google.com/macros/s/') && url.includes('/exec');
}
