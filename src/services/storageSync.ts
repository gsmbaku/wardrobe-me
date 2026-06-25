export type StorageCollection = 'items' | 'outfits' | 'wearLogs' | 'events' | 'conversations';

const STORAGE_CHANGE_EVENT = 'wardrobe-storage-change';

export function notifyStorageChange(collections: StorageCollection[]): void {
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { collections } }));
}

export function subscribeStorageChange(
  listener: (collections: StorageCollection[]) => void
): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ collections: StorageCollection[] }>).detail;
    listener(detail.collections);
  };
  window.addEventListener(STORAGE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(STORAGE_CHANGE_EVENT, handler);
}
