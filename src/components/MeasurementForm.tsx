import { FormEvent, useState } from 'react';
import FormField from './FormField';
import { supabase } from '../lib/supabase';
const nums = ['Shoulder', 'Bust', 'Waist', 'Hip', 'Sleeve Length', 'Armhole', 'Neck', 'Front Length', 'Back Length', 'Pant Length'];
const outfits = ['Blouse', 'Suit', 'Lehenga', 'Saree blouse and fall', 'Bridal outfit', 'Other'];
const key = (l: string) => l.toLowerCase().replace(/ /g, '_');
export default function MeasurementForm() {
  const [s, setS] = useState<'idle' | 'loading' | 'done' | 'error'>('idle'); const [errs, setErrs] = useState<Record<string, string>>({});
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; const x: Record<string, string> = {};
    if (!d.name.trim()) x.name = 'Enter your name.';
    if (!/^[0-9+\s-]{10,15}$/.test(d.phone)) x.phone = 'Enter a valid phone number.';
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) x.email = 'Enter a valid email.';
    nums.forEach(n => { const v = d[key(n)]; if (v && !(+v > 0 && +v <= 300)) x[key(n)] = 'Enter 1 to 300 (cm).'; });
    if (!nums.some(n => d[key(n)]) && !d.other) x.other = 'Enter at least one measurement.';
    setErrs(x); if (Object.keys(x).length || !supabase) return; setS('loading');
    const { error } = await supabase.from('measurements').insert({ data: d });
    if (error) console.error(error); setS(error ? 'error' : 'done');
  }
  if (s === 'done') return <p role="status" className="text-xl">Measurements received. We will use them for your outfit.</p>;
  return (<form onSubmit={submit} noValidate className="space-y-4">
    {!supabase && <p role="alert" className="border border-gold p-3 text-sm">Measurements cannot be saved: Supabase is not configured.</p>}
    <div className="grid gap-4 md:grid-cols-2"><FormField id="name" label="Customer name" error={errs.name} /><FormField id="phone" label="Phone" type="tel" error={errs.phone} />
      <FormField id="email" label="Email (optional)" type="email" error={errs.email} />
      <div><label htmlFor="outfit" className="text-sm">Outfit type</label><select id="outfit" name="outfit" required className="field">{outfits.map(o => <option key={o}>{o}</option>)}</select></div></div>
    <h2 className="text-2xl">Measurements (cm)</h2>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{nums.map(n => <FormField key={n} id={key(n)} label={n} type="number" inputMode="decimal" step="0.1" min="1" max="300" error={errs[key(n)]} />)}</div>
    <FormField id="other" label="Other measurements" error={errs.other} />
    <div><label htmlFor="notes" className="text-sm">Special instructions</label><textarea id="notes" name="notes" rows={3} maxLength={1000} className="field" /></div>
    {s === 'error' && <p role="alert" className="text-sm text-red-800">Could not save. Please try again.</p>}
    <button className="btn btn-dark" disabled={s === 'loading' || !supabase}>{s === 'loading' ? 'Saving...' : 'Submit measurements'}</button></form>);
}
