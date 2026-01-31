import type { WardrobeItem, Outfit, WearLogEntry } from '../../types';
import { STORAGE_KEYS, CURRENT_VERSION } from '../../utils/constants';

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Items
export function getItems(): WardrobeItem[] {
  return getItem<WardrobeItem[]>(STORAGE_KEYS.ITEMS, []);
}

export function setItems(items: WardrobeItem[]): void {
  setItem(STORAGE_KEYS.ITEMS, items);
}

export function addItem(item: WardrobeItem): void {
  const items = getItems();
  items.push(item);
  setItems(items);
}

export function updateItem(id: string, updates: Partial<WardrobeItem>): void {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    setItems(items);
  }
}

export function deleteItem(id: string): void {
  const items = getItems().filter(item => item.id !== id);
  setItems(items);
}

// Outfits
export function getOutfits(): Outfit[] {
  return getItem<Outfit[]>(STORAGE_KEYS.OUTFITS, []);
}

export function setOutfits(outfits: Outfit[]): void {
  setItem(STORAGE_KEYS.OUTFITS, outfits);
}

export function addOutfit(outfit: Outfit): void {
  const outfits = getOutfits();
  outfits.push(outfit);
  setOutfits(outfits);
}

export function updateOutfit(id: string, updates: Partial<Outfit>): void {
  const outfits = getOutfits();
  const index = outfits.findIndex(outfit => outfit.id === id);
  if (index !== -1) {
    outfits[index] = { ...outfits[index], ...updates, updatedAt: new Date().toISOString() };
    setOutfits(outfits);
  }
}

export function deleteOutfit(id: string): void {
  const outfits = getOutfits().filter(outfit => outfit.id !== id);
  setOutfits(outfits);
}

// Wear Logs
export function getWearLogs(): WearLogEntry[] {
  return getItem<WearLogEntry[]>(STORAGE_KEYS.WEAR_LOGS, []);
}

export function setWearLogs(logs: WearLogEntry[]): void {
  setItem(STORAGE_KEYS.WEAR_LOGS, logs);
}

export function addWearLog(log: WearLogEntry): void {
  const logs = getWearLogs();
  logs.push(log);
  setWearLogs(logs);
}

export function updateWearLog(id: string, updates: Partial<WearLogEntry>): void {
  const logs = getWearLogs();
  const index = logs.findIndex(log => log.id === id);
  if (index !== -1) {
    logs[index] = { ...logs[index], ...updates };
    setWearLogs(logs);
  }
}

export function deleteWearLog(id: string): void {
  const logs = getWearLogs().filter(log => log.id !== id);
  setWearLogs(logs);
}

// Version and migration
export function getVersion(): number {
  return getItem<number>(STORAGE_KEYS.VERSION, 0);
}

export function setVersion(version: number): void {
  setItem(STORAGE_KEYS.VERSION, version);
}

export function initializeStorage(): void {
  const version = getVersion();
  if (version < CURRENT_VERSION) {
    // Run migrations if needed
    setVersion(CURRENT_VERSION);
  }
}

// Export all data
export function exportAllData() {
  return {
    version: CURRENT_VERSION,
    items: getItems(),
    outfits: getOutfits(),
    wearLogs: getWearLogs(),
    exportedAt: new Date().toISOString(),
  };
}

// Import data
export function importData(data: { items?: WardrobeItem[]; outfits?: Outfit[]; wearLogs?: WearLogEntry[] }): void {
  if (data.items) setItems(data.items);
  if (data.outfits) setOutfits(data.outfits);
  if (data.wearLogs) setWearLogs(data.wearLogs);
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.OUTFITS);
  localStorage.removeItem(STORAGE_KEYS.WEAR_LOGS);
}
