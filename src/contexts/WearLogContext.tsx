import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { WearLogEntry } from '../types';
import * as storage from '../services/storage/localStorage';

interface WearLogContextType {
  wearLogs: WearLogEntry[];
  loading: boolean;
  addWearLog: (data: { date: string; outfitId?: string; itemIds: string[]; notes?: string }) => void;
  updateWearLog: (id: string, updates: Partial<Omit<WearLogEntry, 'id' | 'createdAt'>>) => void;
  deleteWearLog: (id: string) => void;
  getLogsForDate: (date: string) => WearLogEntry[];
  getWearCountForItem: (itemId: string) => number;
}

const WearLogContext = createContext<WearLogContextType | null>(null);

export function WearLogProvider({ children }: { children: ReactNode }) {
  const [wearLogs, setWearLogs] = useState<WearLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWearLogs(storage.getWearLogs());
    setLoading(false);
  }, []);

  const addWearLog = useCallback((data: { date: string; outfitId?: string; itemIds: string[]; notes?: string }) => {
    const newLog: WearLogEntry = {
      id: uuid(),
      date: data.date,
      outfitId: data.outfitId,
      itemIds: data.itemIds,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    storage.addWearLog(newLog);
    setWearLogs((prev) => [...prev, newLog]);
  }, []);

  const updateWearLog = useCallback((id: string, updates: Partial<Omit<WearLogEntry, 'id' | 'createdAt'>>) => {
    storage.updateWearLog(id, updates);
    setWearLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  }, []);

  const deleteWearLog = useCallback((id: string) => {
    storage.deleteWearLog(id);
    setWearLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  const getLogsForDate = useCallback((date: string) => {
    return wearLogs.filter((log) => log.date === date);
  }, [wearLogs]);

  const getWearCountForItem = useCallback((itemId: string) => {
    return wearLogs.filter((log) => log.itemIds.includes(itemId)).length;
  }, [wearLogs]);

  return (
    <WearLogContext.Provider
      value={{ wearLogs, loading, addWearLog, updateWearLog, deleteWearLog, getLogsForDate, getWearCountForItem }}
    >
      {children}
    </WearLogContext.Provider>
  );
}

export function useWearLogContext() {
  const context = useContext(WearLogContext);
  if (!context) throw new Error('useWearLogContext must be used within WearLogProvider');
  return context;
}
