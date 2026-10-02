import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
type Row = Record<string, any>;
// Read-only list with search and delete, for customer submissions (enquiries, measurements).
export default function RecordList({ table, title, summary, detail }: { table: string; title: string; summary: (r: Row) => string; detail: (r: Row) => (string | null)[] }) {
  const [rows, setRows] = useState<Row[]>([]); const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading'); const [q, setQ] = useState(''); const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    if (!supabase) return setState('error');
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); setState('error'); } else { setRows(data); setState('ready'); }
  }, [table]);
  useEffect(() => { load(); }, [load]);
  async function del(r: Row) {
    if (!supabase || !confirm(`Delete "${summary(r)}"? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().eq('id', r.id); if (error) { console.error(error); setMsg('Could not delete. You may not have permission, or the connection failed.'); } else setMsg('Deleted.'); load();
  }
  const list = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return (<section><h2 className="text-3xl">{title}</h2>
    <input aria-label="Search" className="field mt-4 md:w-1/2" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
    {msg && <p role="status" className="mt-3 text-sm">{msg}</p>}
    {state === 'loading' ? <p className="mt-4">Loading...</p> : state === 'error' ? <p role="alert" className="mt-4 text-red-800">Could not load {title.toLowerCase()}. Check the Supabase connection and your admin role.</p>
      : list.length === 0 ? <p className="mt-4">No {title.toLowerCase()} yet.</p>
      : <ul className="mt-4 space-y-3">{list.map(r => <li key={r.id} className="border border-line bg-white p-3"><details>
        <summary className="cursor-pointer text-sm">{summary(r)} · {new Date(r.created_at).toLocaleDateString('en-IN')}</summary>
        <ul className="mt-2 text-sm">{detail(r).filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}</ul>
        <button className="btn btn-line mt-3 !px-3 !py-1.5" onClick={() => del(r)}>Delete</button></details></li>)}</ul>}
  </section>);
}
