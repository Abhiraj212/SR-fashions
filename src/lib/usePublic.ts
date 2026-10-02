import { useEffect, useState } from 'react';
import { supabase } from './supabase';
// Loads public rows from Supabase; falls back to demo data when Supabase is not configured or fails.
export function usePublic<T>(table: string, fallback: T[]) {
  const [rows, setRows] = useState<T[]>(fallback); const [loading, setLoading] = useState(!!supabase);
  useEffect(() => { if (!supabase) return; let on = true;
    supabase.from(table).select('*').order('created_at', { ascending: false }).then(({ data, error }) => { if (on) { if (!error && data) setRows(data as T[]); setLoading(false); } });
    return () => { on = false; }; }, [table]);
  return { rows, loading };
}
const DESC = 'SR Fashions by Seema Boutique: sarees, suits, lehengas, blouses and custom stitching. Enquire on WhatsApp or book an appointment.';
export function usePageTitle(t: string, desc?: string) {
  useEffect(() => { document.title = t ? `${t} | SR Fashions` : 'SR Fashions | Seema Boutique'; document.querySelector('meta[name="description"]')?.setAttribute('content', desc ?? DESC); }, [t, desc]);
}
