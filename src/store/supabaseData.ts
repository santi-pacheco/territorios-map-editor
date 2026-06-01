import { supabase } from './supabaseClient';
import type { AppData } from '../types';

export async function loadAppData(): Promise<AppData> {
  const { data, error } = await supabase.from('app_data').select('data').eq('id', 1).single();
  if (error) throw new Error(error.message);
  return (data as { data: AppData }).data;
}

export async function saveAppData(appData: AppData): Promise<void> {
  const { error } = await supabase
    .from('app_data')
    .update({ data: appData, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw new Error(error.message);
}

export function subscribeAppData(onChange: (data: AppData) => void): () => void {
  const channel = supabase
    .channel('app_data_changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'app_data' },
      (payload: { new: { data: AppData } }) => onChange(payload.new.data)
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
