import type { ScanResult } from "./store";

export type ScanHistoryItem = {
  id: string;
  thumb: string; // base64 data url, downscaled
  result: ScanResult;
  expiracaoMin: 1 | 5;
  createdAt: string;
};

const KEY = "orion.scan.history";
const CAP = 30;

export function loadScanHistory(): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScanHistory(items: ScanHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, CAP)));
  } catch {
    /* quota / private mode - ignore */
  }
}

export function addScanHistory(item: ScanHistoryItem) {
  const next = [item, ...loadScanHistory()].slice(0, CAP);
  saveScanHistory(next);
  return next;
}

export function removeScanHistory(id: string) {
  const next = loadScanHistory().filter((x) => x.id !== id);
  saveScanHistory(next);
  return next;
}

export function clearScanHistory() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

// Downscale image to a small thumbnail data URL for storage.
export async function makeThumb(dataUrl: string, maxW = 480): Promise<string> {
  if (typeof window === "undefined") return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(c.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
