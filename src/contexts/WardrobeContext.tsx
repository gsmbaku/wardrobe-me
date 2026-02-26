import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { WardrobeItem, Category, Season, Fit } from '../types';
import * as storage from '../services/storage/localStorage';
import { saveImage, deleteImage } from '../services/storage/indexedDB';
import { compressImage, generateThumbnail } from '../services/imageService';

interface WardrobeContextType {
  items: WardrobeItem[];
  loading: boolean;
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
  }) => Promise<void>;
  updateItem: (id: string, updates: Partial<Omit<WardrobeItem, 'id' | 'imageId' | 'createdAt'>>) => void;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => WardrobeItem | undefined;
}

const WardrobeContext = createContext<WardrobeContextType | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.initializeStorage();
    setItems(storage.getItems());
    setLoading(false);
  }, []);

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
  }) => {
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
      createdAt: now,
      updatedAt: now,
    };

    storage.addItem(newItem);
    setItems((prev) => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<WardrobeItem, 'id' | 'imageId' | 'createdAt'>>) => {
    storage.updateItem(id, updates);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  }, []);

  const deleteItemFn = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      await deleteImage(item.imageId);
      storage.deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }, [items]);

  const getItem = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  return (
    <WardrobeContext.Provider value={{ items, loading, addItem, updateItem, deleteItem: deleteItemFn, getItem }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobeContext() {
  const context = useContext(WardrobeContext);
  if (!context) throw new Error('useWardrobeContext must be used within WardrobeProvider');
  return context;
}
