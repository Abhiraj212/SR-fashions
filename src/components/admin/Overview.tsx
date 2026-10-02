import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
const tables = ['products', 'appointments', 'enquiries', 'measurements', 'testimonials', 'gallery'];
export default function Overview() {
  const [n, setN] = useState<Record<string, number | null>>({});
  useEffect(() => { tables.forEach(t => supabase?.from(t).select('*', { count: 'exact', head: true }).then(({ count, error }) => setN(p => ({ ...p, [t]: error ? null : count })))); }, []);
  if (!supabase) return <p role="alert" className="text-red-800">Supabase is not configured, so counts are unavailable.</p>;
  return (<section><h2 className="text-3xl">Overview</h2><ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">{tables.map(t =>
    <li key={t} className="border border-line bg-white p-4"><p className="text-sm capitalize">{t}</p><p className="font-display text-4xl">{n[t] === undefined ? '...' : n[t] ?? '-'}</p></li>)}</ul></section>);
}
