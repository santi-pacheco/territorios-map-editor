import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { appReducer, type Action } from './reducer';
import { loadAppData, saveAppData, subscribeAppData } from './supabaseData';
import { emptyAppData, type AppData } from '../types';

interface Ctx {
  data: AppData;
  dispatch: (a: Action) => void;
  loading: boolean;
  error: string | null;
}

const AppDataContext = createContext<Ctx | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, baseDispatch] = useReducer(appReducer, emptyAppData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const remoteEcho = useRef(false);       // true while applying a remote update (don't re-save)
  const saveTimer = useRef<number | null>(null);

  // Initial load + realtime subscription.
  useEffect(() => {
    let cancelled = false;
    loadAppData()
      .then((d) => { if (!cancelled) { remoteEcho.current = true; baseDispatch({ type: 'replace', data: d }); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Error'); setLoading(false); } });
    const unsub = subscribeAppData((d) => { remoteEcho.current = true; baseDispatch({ type: 'replace', data: d }); });
    return () => { cancelled = true; unsub(); };
  }, []);

  // Debounced save on local change (skips remote echoes).
  useEffect(() => {
    if (loading) return;
    if (remoteEcho.current) { remoteEcho.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveAppData(data).catch((e) => setError(e instanceof Error ? e.message : 'Error al guardar'));
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data, loading]);

  return <AppDataContext.Provider value={{ data, dispatch: baseDispatch, loading, error }}>{children}</AppDataContext.Provider>;
}

export function useAppData(): Ctx {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
