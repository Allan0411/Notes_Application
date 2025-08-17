// utils/parseChecklistItems.js

export function parseChecklistItems(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    }
    return [];
  }
  