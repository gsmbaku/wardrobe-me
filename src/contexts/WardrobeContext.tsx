import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { WardrobeItem, Category, Season, Fit } from '../types';
import * as storage from '../services/storage/localStorage';
import { saveImage, deleteImage } from '../services/storage/indexedDB';
import { compressImage, generateThumbnail } from '../services/imageService';
import { cleanupItemReferences, repairAllData } from '../services/dataIntegrityService';
import { notifyStorageChange, subscribeStorageChange } from '../services/storageSync';
import { useAuth } from './AuthContext';
import { addRemoteItem, deleteRemoteItem, listRemoteItems, updateRemoteItem } from '../services/wardrobeSupabase';

interface WardrobeContextType {
  items: WardrobeItem[];
  loading: boolean;
  error?: string | null;
  addItem: (data: {
    name: string;
    category: Category;
    color: string;
    seasons: Season[];
    image: File;
    brand?: string;
    purchaseDate?: string;
    price?: number;
    notes?: string;
    size?: string;
    tags?: string[];
    fit?: Fit;
    forSale?: boolean;
    saleLink?: string;
    storageSpaceId?: string;
  }) => Promise<void>;
  updateItem: (
    id: string,
    updates: Partial<Omit<WardrobeItem, 'id' | 'imageId' | 'createdAt'>>,
    image?: File
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => WardrobeItem | undefined;
  refresh: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, ready } = useAuth();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const remote = await listRemoteItems();
        setItems(remote);
      } else {
        storage.initializeStorage();
        repairAllData();
        setItems(storage.getItems());
      }
    } catch (e) {
      setError('Failed to load wardrobe items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) {
          // no-op; refresh already toggles loading
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, ready, refresh]);

  useEffect(() => {
    return subscribeStorageChange((collections) => {
      if (collections.includes('items')) {
        if (!user) {
          setItems(storage.getItems());
        }
      }
    });
  }, [user?.id]);

  const addItem = useCallback(async (data: {
    name: string;
    category: Category;
    color: string;
    seasons: Season[];
    image: File;
    brand?: string;
    purchaseDate?: string;
    price?: number;
    notes?: string;
    size?: string;
    tags?: string[];
    fit?: Fit;
    forSale?: boolean;
    saleLink?: string;
    storageSpaceId?: string;
  }) => {
    if (user) {
      const created = await addRemoteItem(user.id, data);
      setItems((prev) => [...prev, created]);
      return;
    }
    // Local fallback
    const imageId = uuid();
    const compressed = await compressImage(data.image);
    const thumbnail = await generateThumbnail(compressed);
    await saveImage(imageId, compressed, thumbnail);

    const now = new Date().toISOString();
    const newItem: WardrobeItem = {
      id: uuid(),
      name: data.name,
      category: data.category,
      color: data.color,
      seasons: data.seasons,
      imageId,
      brand: data.brand,
      purchaseDate: data.purchaseDate,
      price: data.price,
      notes: data.notes,
      size: data.size,
      tags: data.tags,
      fit: data.fit,
      forSale: data.forSale,
      saleLink: data.saleLink,
      storageSpaceId: data.storageSpaceId,
      createdAt: now,
      updatedAt: now,
    };
    storage.addItem(newItem);
    setItems((prev) => [...prev, newItem]);
  }, [user?.id]);

  const updateItem = useCallback(async (
    id: string,
    updates: Partial<Omit<WardrobeItem, 'id' | 'imageId' | 'createdAt'>>,
    image?: File
  ) => {
    if (user) {
      const { newImageId } = await updateRemoteItem(user.id, id, updates, image);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                imageId: newImageId ?? item.imageId,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
      return;
    }
    if (image) {
      const item = storage.getItems().find(i => i.id === id);
      if (item) {
        const compressed = await compressImage(image);
        const thumbnail = await generateThumbnail(compressed);
        await saveImage(item.imageId, compressed, thumbnail);
      }
    }
    storage.updateItem(id, updates);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  }, [user?.id]);

  const deleteItemFn = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    cleanupItemReferences(id);
    if (user) {
      await deleteRemoteItem(user.id, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      notifyStorageChange(['outfits', 'wearLogs', 'conversations']);
      return;
    }
    await deleteImage(item.imageId);
    storage.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    notifyStorageChange(['outfits', 'wearLogs', 'conversations']);
  }, [items, user?.id]);

  const getItem = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  return (
    <WardrobeContext.Provider value={{ items, loading, error, addItem, updateItem, deleteItem: deleteItemFn, getItem, refresh }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobeContext() {
  const context = useContext(WardrobeContext);
  if (!context) throw new Error('useWardrobeContext must be used within WardrobeProvider');
  return context;
}
