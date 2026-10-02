import { FormEvent, useState } from 'react';
import { services } from '../data/demo';
import { usePageTitle } from '../lib/usePublic';
import { supabase } from '../lib/supabase';
type S = 'idle' | 'loading' | 'done' | 'error';
export default function Book() {
  usePageTitle('Book an appointment', 'Request an appointment at Seema Boutique for stitching, fittings or styling.');
  const [s, setS] = useState<S>('idle'); const [err, setErr] = useState('');
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!d.name.trim()) return setErr('Enter your name.');
    if (!/^[0-9+\s-]{10,15}$/.test(d.phone)) return setErr('Enter a valid phone number.');
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return setErr('Enter a valid email address.');
    if (!d.date || d.date < today) return setErr('Choose today or a future date.');
    if (!d.time || d.time < '10:00' || d.time > '19:00') return setErr('Choose a time between 10:00 and 19:00.');
    if (d.date === today && d.time < new Date().toTimeString().slice(0, 5)) return setErr('Choose a time later today.');
    if (!supabase) return setErr('The booking service is not configured yet. Please contact us on WhatsApp or by phone.');
    setErr(''); setS('loading');
    try {
      { const { error } = await supabase.from('appointments').insert({ name: d.name, phone: d.phone, email: d.email || null, service: d.service, preferred_date: d.date, preferred_time: d.time, message: d.message || null }); if (error) throw error; }
      setS('done');
    } catch (e) { console.error(e); setS('error'); setErr('Could not send your request. Please try again or use WhatsApp.'); }
  }
  if (s === 'done') return <p className="mx-auto max-w-xl px-4 py-16 text-xl" role="status">Request received. We will confirm your appointment by phone or WhatsApp.</p>;
  return (<form onSubmit={submit} className="mx-auto max-w-xl space-y-4 px-4 py-10" noValidate>
    <h1 className="text-5xl">Book an appointment</h1>
    {[['name', 'Name', 'text'], ['phone', 'Phone', 'tel'], ['email', 'Email (optional)', 'email']].map(([n, l, t]) =>
      <div key={n}><label htmlFor={n} className="text-sm">{l}</label><input id={n} name={n} type={t} maxLength={120} className="field" /></div>)}
    <div><label htmlFor="service" className="text-sm">Service</label><select id="service" name="service" className="field">{services.map(x => <option key={x}>{x}</option>)}</select></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label htmlFor="date" className="text-sm">Date</label><input id="date" name="date" type="date" min={today} required className="field" /></div>
      <div><label htmlFor="time" className="text-sm">Time</label><input id="time" name="time" type="time" min="10:00" max="19:00" required className="field" /></div>
    </div>
    <div><label htmlFor="message" className="text-sm">Message</label><textarea id="message" name="message" rows={3} maxLength={1000} className="field" /></div>
    {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
    <button className="btn btn-dark" disabled={s === 'loading'}>{s === 'loading' ? 'Sending...' : 'Request appointment'}</button>
  </form>);
}
