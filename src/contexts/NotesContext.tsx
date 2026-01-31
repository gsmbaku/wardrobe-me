import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { Note } from '../types';
import * as storage from '../services/storage/localStorage';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  addNote: (data: { title: string; content: string }) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNotes(storage.getNotes());
    setLoading(false);
  }, []);

  const addNote = useCallback((data: { title: string; content: string }) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: uuid(),
      title: data.title,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };

    storage.addNote(newNote);
    setNotes((prev) => [...prev, newNote]);
  }, []);

  const updateNoteFn = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    storage.updateNote(id, updates);
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      )
    );
  }, []);

  const deleteNoteFn = useCallback((id: string) => {
    storage.deleteNote(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const getNote = useCallback((id: string) => {
    return notes.find((note) => note.id === id);
  }, [notes]);

  return (
    <NotesContext.Provider value={{ notes, loading, addNote, updateNote: updateNoteFn, deleteNote: deleteNoteFn, getNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotesContext must be used within NotesProvider');
  return context;
}
