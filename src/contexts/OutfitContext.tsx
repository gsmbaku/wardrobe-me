import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { Outfit, OutfitItemPosition } from '../types';
import * as storage from '../services/storage/localStorage';

interface OutfitContextType {
  outfits: Outfit[];
  loading: boolean;
  addOutfit: (data: { name: string; description?: string; items: OutfitItemPosition[] }) => void;
  updateOutfit: (id: string, updates: Partial<Omit<Outfit, 'id' | 'createdAt'>>) => void;
  deleteOutfit: (id: string) => void;
  getOutfit: (id: string) => Outfit | undefined;
}

const OutfitContext = createContext<OutfitContextType | null>(null);

export function OutfitProvider({ children }: { children: ReactNode }) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOutfits(storage.getOutfits());
    setLoading(false);
  }, []);

  const addOutfit = useCallback((data: { name: string; description?: string; items: OutfitItemPosition[] }) => {
    const now = new Date().toISOString();
    const newOutfit: Outfit = {
      id: uuid(),
      name: data.name,
      description: data.description,
      items: data.items,
      createdAt: now,
      updatedAt: now,
    };

    storage.addOutfit(newOutfit);
    setOutfits((prev) => [...prev, newOutfit]);
  }, []);

  const updateOutfit = useCallback((id: string, updates: Partial<Omit<Outfit, 'id' | 'createdAt'>>) => {
    storage.updateOutfit(id, updates);
    setOutfits((prev) =>
      prev.map((outfit) =>
        outfit.id === id ? { ...outfit, ...updates, updatedAt: new Date().toISOString() } : outfit
      )
    );
  }, []);

  const deleteOutfit = useCallback((id: string) => {
    storage.deleteOutfit(id);
    setOutfits((prev) => prev.filter((outfit) => outfit.id !== id));
  }, []);

  const getOutfit = useCallback((id: string) => {
    return outfits.find((outfit) => outfit.id === id);
  }, [outfits]);

  return (
    <OutfitContext.Provider value={{ outfits, loading, addOutfit, updateOutfit, deleteOutfit, getOutfit }}>
      {children}
    </OutfitContext.Provider>
  );
}

export function useOutfitContext() {
  const context = useContext(OutfitContext);
  if (!context) throw new Error('useOutfitContext must be used within OutfitProvider');
  return context;
}
