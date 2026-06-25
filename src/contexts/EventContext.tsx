import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { PlannedEvent, Occasion } from '../types';
import * as storage from '../services/storage/localStorage';
import { subscribeStorageChange } from '../services/storageSync';

interface EventContextType {
  events: PlannedEvent[];
  loading: boolean;
  addEvent: (data: {
    name: string;
    date: string;
    occasion: Occasion;
    outfitId?: string;
    notes?: string;
  }) => void;
  updateEvent: (id: string, updates: Partial<Omit<PlannedEvent, 'id' | 'createdAt'>>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => PlannedEvent | undefined;
  getEventsForDate: (date: string) => PlannedEvent[];
}

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<PlannedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents(storage.getEvents());
    setLoading(false);
  }, []);

  useEffect(() => {
    return subscribeStorageChange((collections) => {
      if (collections.includes('events')) {
        setEvents(storage.getEvents());
      }
    });
  }, []);

  const addEvent = useCallback((data: {
    name: string;
    date: string;
    occasion: Occasion;
    outfitId?: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    const newEvent: PlannedEvent = {
      id: uuid(),
      name: data.name,
      date: data.date,
      occasion: data.occasion,
      outfitId: data.outfitId,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    storage.addEvent(newEvent);
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Omit<PlannedEvent, 'id' | 'createdAt'>>) => {
    storage.updateEvent(id, updates);
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    storage.deleteEvent(id);
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const getEvent = useCallback((id: string) => {
    return events.find((event) => event.id === id);
  }, [events]);

  const getEventsForDate = useCallback((date: string) => {
    return events.filter((event) => event.date === date);
  }, [events]);

  return (
    <EventContext.Provider value={{ events, loading, addEvent, updateEvent, deleteEvent, getEvent, getEventsForDate }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEventContext must be used within EventProvider');
  return context;
}
