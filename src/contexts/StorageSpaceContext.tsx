import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { StorageSpace, StorageSpaceType } from '../types';
import * as storage from '../services/storage/localStorage';

interface StorageSpaceContextType {
  storageSpaces: StorageSpace[];
  loading: boolean;
  addStorageSpace: (data: { name: string; type: StorageSpaceType; location?: string }) => void;
  updateStorageSpace: (id: string, updates: Partial<Pick<StorageSpace, 'name' | 'type' | 'location'>>) => void;
  deleteStorageSpace: (id: string) => void;
  getStorageSpace: (id: string) => StorageSpace | undefined;
}

const StorageSpaceContext = createContext<StorageSpaceContextType | null>(null);

export function StorageSpaceProvider({ children }: { children: ReactNode }) {
  const [storageSpaces, setStorageSpaces] = useState<StorageSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStorageSpaces(storage.getStorageSpaces());
    setLoading(false);
  }, []);

  const addStorageSpace = useCallback((data: { name: string; type: StorageSpaceType; location?: string }) => {
    const now = new Date().toISOString();
    const newSpace: StorageSpace = {
      id: uuid(),
      name: data.name,
      type: data.type,
      location: data.location,
      createdAt: now,
      updatedAt: now,
    };

    storage.addStorageSpace(newSpace);
    setStorageSpaces((prev) => [...prev, newSpace]);
  }, []);

  const updateStorageSpaceFn = useCallback((id: string, updates: Partial<Pick<StorageSpace, 'name' | 'type' | 'location'>>) => {
    storage.updateStorageSpace(id, updates);
    setStorageSpaces((prev) =>
      prev.map((space) =>
        space.id === id ? { ...space, ...updates, updatedAt: new Date().toISOString() } : space
      )
    );
  }, []);

  const deleteStorageSpaceFn = useCallback((id: string) => {
    storage.deleteStorageSpace(id);
    setStorageSpaces((prev) => prev.filter((space) => space.id !== id));
  }, []);

  const getStorageSpace = useCallback((id: string) => {
    return storageSpaces.find((space) => space.id === id);
  }, [storageSpaces]);

  return (
    <StorageSpaceContext.Provider value={{
      storageSpaces,
      loading,
      addStorageSpace,
      updateStorageSpace: updateStorageSpaceFn,
      deleteStorageSpace: deleteStorageSpaceFn,
      getStorageSpace
    }}>
      {children}
    </StorageSpaceContext.Provider>
  );
}

export function useStorageSpaceContext() {
  const context = useContext(StorageSpaceContext);
  if (!context) throw new Error('useStorageSpaceContext must be used within StorageSpaceProvider');
  return context;
}
