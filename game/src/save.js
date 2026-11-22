// Save system module for Harbor Heat.
// Safely saves and loads player progress (money, position, wanted level) to/from localStorage.

import { SAVE_KEY } from './config.js';

export function saveProgress(data) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }
  } catch {}
}

export function loadProgress() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(SAVE_KEY);
      if (item) return JSON.parse(item);
    }
  } catch {}
  return null;
}
