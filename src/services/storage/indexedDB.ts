import { IMAGE_DB_NAME, IMAGE_STORE_NAME } from '../../utils/constants';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        database.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export interface StoredImage {
  id: string;
  data: Blob;
  thumbnail: Blob;
  createdAt: string;
}

export async function saveImage(id: string, data: Blob, thumbnail: Blob): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const record: StoredImage = {
      id,
      data,
      thumbnail,
      createdAt: new Date().toISOString(),
    };
    const request = store.put(record);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getImage(id: string): Promise<StoredImage | null> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function deleteImage(id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllImages(): Promise<StoredImage[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function clearAllImages(): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
