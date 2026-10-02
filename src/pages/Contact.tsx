import { FormEvent, useState } from 'react';
import { SITE } from '../config/site';
import FormField from '../components/FormField';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../lib/usePublic';
import { waLink, msgs } from '../lib/whatsapp';
export default function Contact() {
  usePageTitle('Contact', 'Contact Seema Boutique by phone, WhatsApp, email or message.');
  const [s, setS] = useState<'idle' | 'loading' | 'done' | 'error'>('idle'); const [errs, setErrs] = useState<Record<string, string>>({}); const [fail, setFail] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; const x: Record<string, string> = {};
    if (!d.name.trim()) x.name = 'Enter your name.';
    if (!/^[0-9+\s-]{10,15}$/.test(d.phone)) x.phone = 'Enter a valid phone number.';
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) x.email = 'Enter a valid email.';
    if (d.message.trim().length < 5) x.message = 'Write a short message.';
    setErrs(x); if (Object.keys(x).length || !supabase) return; setS('loading');
    const { error } = await supabase.from('enquiries').insert({ name: d.name, phone: d.phone, email: d.email || null, message: d.message });
    if (error) { console.error(error); setS('error'); setFail('Could not send your message. Please try again or use WhatsApp.'); } else setS('done');
  }
  const info: [string, string, string?][] = [['Phone', SITE.phone, `tel:${SITE.phone.replace(/\s/g, '')}`], ['Email', SITE.email, `mailto:${SITE.email}`], ['Address', SITE.address], ['Hours', SITE.hours]].filter(r => r[1]) as [string, string, string?][];
  return (<div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
    <section><h1 className="text-5xl text-plum">Contact {SITE.boutique}</h1>
      <dl className="mt-6 space-y-3">{info.map(([k, v, h]) => <div key={k}><dt className="text-sm text-ink/70">{k}</dt><dd>{h ? <a className="underline" href={h}>{v}</a> : v}</dd></div>)}</dl>{info.length === 0 && <p className="mt-6">Contact details will be added soon. Please send us a message.</p>}
      <div className="mt-6 flex flex-wrap gap-3"><a className="btn btn-dark" target="_blank" rel="noreferrer" href={waLink(msgs.general())}>WhatsApp</a>
        {SITE.phone && <a className="btn btn-line" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>Call</a>}{SITE.email && <a className="btn btn-line" href={`mailto:${SITE.email}`}>Email</a>}
        {Object.entries(SITE.social).filter(([, u]) => u).map(([n, u]) => <a key={n} className="btn btn-line capitalize" href={u} target="_blank" rel="noreferrer">{n}</a>)}</div>
      {SITE.mapEmbedUrl ? <iframe title="Boutique location" src={SITE.mapEmbedUrl} loading="lazy" className="mt-6 h-64 w-full border-0" />
        : <div className="mt-6 flex h-64 items-center justify-center border border-line text-sm">Map: set mapEmbedUrl in src/config/site.ts</div>}</section>
    {s === 'done' ? <p role="status" className="text-xl">Message sent. We will get back to you soon.</p> :
      <form onSubmit={submit} noValidate className="space-y-4">
        {!supabase && <p role="alert" className="border border-gold p-3 text-sm">Messages cannot be saved: Supabase is not configured. Please use WhatsApp, call or email.</p>}
        <FormField id="name" label="Name" error={errs.name} /><FormField id="phone" label="Phone" type="tel" error={errs.phone} />
        <FormField id="email" label="Email (optional)" type="email" error={errs.email} />
        <div><label htmlFor="message" className="text-sm">Message</label><textarea id="message" name="message" rows={4} maxLength={2000} className="field" />{errs.message && <p role="alert" className="text-xs text-red-800">{errs.message}</p>}</div>
        {s === 'error' && <p role="alert" className="text-sm text-red-800">{fail}</p>}
        <button className="btn btn-dark" disabled={s === 'loading' || !supabase}>{s === 'loading' ? 'Sending...' : 'Send message'}</button></form>}
  </div>);
}
