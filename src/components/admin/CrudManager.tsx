import { FormEvent, useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
export type Field = { key: string; label: string; type: 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'list'; options?: [string, string][]; num?: boolean; required?: boolean; upload?: boolean };
type Row = Record<string, any>;
export default function CrudManager({ table, title, fields, summary, defaults = {} }: { table: string; title: string; fields: Field[]; summary: (r: Row) => string; defaults?: Row }) {
  const [rows, setRows] = useState<Row[]>([]); const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [edit, setEdit] = useState<Row | null>(null); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const [ver, setVer] = useState(0);
  const load = useCallback(async () => {
    if (!supabase) return setState('error');
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); setState('error'); } else { setRows(data); setState('ready'); }
  }, [table]);
  useEffect(() => { load(); }, [load]);
  const fail = (e: unknown, what: string) => { console.error(e); setMsg(`Could not ${what}. You may not have permission, or the connection failed.`); };
  async function save(e: FormEvent) {
    e.preventDefault(); if (!supabase || !edit) return; setBusy(true);
    const { id, created_at, ...body } = edit;
    fields.filter(f => f.type === 'list').forEach(f => { body[f.key] = (body[f.key] ?? []).filter(Boolean); });
    const { error } = id ? await supabase.from(table).update(body).eq('id', id) : await supabase.from(table).insert(body);
    setBusy(false); if (error) return fail(error, 'save');
    setMsg('Saved.'); setEdit(null); load();
  }
  async function del(r: Row) {
    if (!supabase || !confirm(`Delete "${summary(r)}"? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().eq('id', r.id);
    if (error) fail(error, 'delete'); else {
      const paths = fields.filter(f => f.upload).flatMap(f => ([] as string[]).concat(r[f.key] ?? [])).map(u => u.split('/object/public/media/')[1]).filter(Boolean).map(decodeURIComponent);
      if (paths.length) await supabase.storage.from('media').remove(paths);
      setMsg('Deleted.');
    }
    load();
  }
  async function upload(f: Field, file: File) {
    if (!supabase) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) return setMsg('Only JPG, PNG, WebP or GIF images are allowed.');
    if (file.size > 5 * 1024 * 1024) return setMsg('Image is larger than 5 MB.');
    const path = `${table}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { console.error(error); return setMsg('Upload failed. Check your permissions and connection, then try again.'); }
    const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
    set(f.key, f.type === 'list' ? [...(edit?.[f.key] ?? []).filter(Boolean), url] : url); setVer(v => v + 1); setMsg('Image uploaded.');
  }
  const set = (k: string, v: any) => setEdit(p => ({ ...p, [k]: v }));
  return (<section><div className="flex items-center justify-between"><h2 className="text-3xl">{title}</h2><button className="btn btn-dark" onClick={() => setEdit({ ...defaults })}>Add</button></div>
    {msg && <p role="status" className="mt-3 text-sm">{msg}</p>}
    {edit && <form onSubmit={save} className="mt-4 grid gap-3 border border-line bg-white p-4 md:grid-cols-2">
      {fields.map(f => { const v = edit[f.key]; const id = `f-${f.key}`; return (<div key={f.key + (edit.id ?? 'new') + ver} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
        {f.type === 'checkbox' ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v} onChange={e => set(f.key, e.target.checked)} />{f.label}</label> : <>
          <label htmlFor={id} className="text-sm">{f.label}{f.type === 'list' && ' (comma separated)'}</label>
          {f.type === 'textarea' ? <textarea id={id} rows={3} className="field" required={f.required} value={v ?? ''} onChange={e => set(f.key, e.target.value)} />
            : f.type === 'select' ? <select id={id} className="field" required={f.required} value={v ?? ''} onChange={e => set(f.key, f.num ? Number(e.target.value) : e.target.value)}><option value="">Select</option>{f.options!.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select>
            : f.type === 'list' ? <input id={id} className="field" defaultValue={(v ?? []).join(', ')} onChange={e => set(f.key, e.target.value.split(',').map(x => x.trim()))} />
            : <input id={id} className="field" type={f.type} required={f.required} value={v ?? ''} onChange={e => set(f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />}{f.upload && <input type="file" accept="image/*" aria-label={`Upload ${f.label}`} className="mt-1 text-sm" onChange={e => e.target.files?.[0] && upload(f, e.target.files[0])} />}</>}</div>); })}
      <div className="flex gap-3 md:col-span-2"><button className="btn btn-dark" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button><button type="button" className="btn btn-line" onClick={() => setEdit(null)}>Cancel</button></div></form>}
    {state === 'loading' ? <p className="mt-4">Loading...</p> : state === 'error' ? <p role="alert" className="mt-4 text-red-800">Could not load {title.toLowerCase()}. Check the Supabase connection and your admin role.</p>
      : rows.length === 0 ? <p className="mt-4">Nothing here yet. Use Add to create the first entry.</p>
      : <ul className="mt-4 grid gap-3 md:grid-cols-2">{rows.map(r => <li key={r.id} className="flex items-center justify-between gap-3 border border-line bg-white p-3">
        <span className="text-sm">{summary(r)}</span><span className="flex gap-2"><button className="btn btn-line !px-3 !py-1.5" onClick={() => setEdit(r)}>Edit</button><button className="btn btn-line !px-3 !py-1.5" onClick={() => del(r)}>Delete</button></span></li>)}</ul>}
  </section>);
}
