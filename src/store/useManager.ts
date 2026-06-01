import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const MANAGER_EMAIL = import.meta.env.VITE_MANAGER_EMAIL as string;

export function useManager() {
  const [isManager, setIsManager] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsManager(!!data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsManager(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(passcode: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email: MANAGER_EMAIL, password: passcode });
    if (error) throw new Error('Código incorrecto');
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  return { isManager, checking, login, logout };
}
