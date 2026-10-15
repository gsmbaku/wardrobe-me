import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSupabase, hasSupabaseEnv } from '../services/supabaseClient';

interface AuthContextType {
  ready: boolean;
  isConfigured: boolean;
  user: { id: string; email: string | null } | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    // Load current session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
      }
      setReady(true);
    });
    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
      } else {
        setUser(null);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    ready,
    isConfigured: hasSupabaseEnv(),
    user,
    async signInWithPassword(email: string, password: string) {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signUpWithPassword(email: string, password: string) {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    async signOut() {
      const supabase = getSupabase();
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  }), [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

