import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
type A = { id: string; name: string; phone: string; email: string | null; service: string | null; preferred_date: string | null; preferred_time: string | null; message: string | null; status: string };
const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
export default function AppointmentsAdmin() {
  const [rows, setRows] = useState<A[]>([]); const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [date, setDate] = useState(''); const [msg, setMsg] = useState('');
  const load = async () => { if (!supabase) return setState('error'); const { data, error } = await supabase.from('appointments').select('*').order('preferred_date', { ascending: false }); if (error) { console.error(error); setState('error'); } else { setRows(data as A[]); setState('ready'); } };
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string) { const { error } = await supabase!.from('appointments').update({ status }).eq('id', id); if (error) { console.error(error); setMsg('Could not update the status.'); } else setMsg('Status updated.'); load(); }
  const list = rows.filter(r => (!st || r.status === st) && (!date || r.preferred_date === date) && `${r.name} ${r.phone} ${r.service}`.toLowerCase().includes(q.toLowerCase()));
  return (<section><h2 className="text-3xl">Appointments</h2>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <input aria-label="Search" className="field" placeholder="Search name, phone, service" value={q} onChange={e => setQ(e.target.value)} />
      <select aria-label="Status" className="field" value={st} onChange={e => setSt(e.target.value)}><option value="">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
      <input aria-label="Date" type="date" className="field" value={date} onChange={e => setDate(e.target.value)} /></div>
    {msg && <p role="status" className="mt-3 text-sm">{msg}</p>}
    {state === 'loading' ? <p className="mt-4">Loading...</p> : state === 'error' ? <p role="alert" className="mt-4 text-red-800">Could not load appointments. Check the Supabase connection and your admin role.</p>
      : list.length === 0 ? <p className="mt-4">No appointments match.</p>
      : <ul className="mt-4 space-y-3">{list.map(r => <li key={r.id} className="border border-line bg-white p-3"><details>
        <summary className="cursor-pointer text-sm">{r.name} · {r.service} · {r.preferred_date} {r.preferred_time} · {r.status}</summary>
        <p className="mt-2 text-sm">Phone: {r.phone}{r.email && ` · ${r.email}`}</p>{r.message && <p className="text-sm">{r.message}</p>}
        <label className="mt-2 block text-sm">Status <select className="field mt-1" value={r.status} onChange={e => setStatus(r.id, e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label></details></li>)}</ul>}
  </section>);
}
