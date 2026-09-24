const EXPLORER_OPEN_STORAGE_KEY = "pi-web:file-explorer:open";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadExplorerOpen(
  storage: StorageLike | null = getBrowserStorage(),
  whenUnset = true,
): boolean {
  if (!storage) return whenUnset;
  try {
    const stored = storage.getItem(EXPLORER_OPEN_STORAGE_KEY);
    if (stored === null) return whenUnset;
    return stored !== "false";
  } catch {
    return whenUnset;
  }
}

export function saveExplorerOpen(
  open: boolean,
  storage: StorageLike | null = getBrowserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(EXPLORER_OPEN_STORAGE_KEY, String(open));
  } catch {
    // Persistence is best-effort; privacy mode and storage quotas must not break the explorer.
  }
}
