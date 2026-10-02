import { FormEvent, useCallback, useEffect, useState } from 'react';
import AdminPanel from '../components/admin/AdminPanel';
import FormField from '../components/FormField';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../lib/usePublic';
type State = 'loading' | 'unconfigured' | 'login' | 'denied' | 'ok';
// Admin data is only rendered when the signed-in user's profile has role = 'admin'. RLS enforces the same on the server.
export default function Admin() {
  usePageTitle('Admin');
  const [state, setState] = useState<State>('loading'); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const check = useCallback(async () => {
    if (!supabase) return setState('unconfigured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState('login');
      const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (error) console.error(error);
      setState(data?.role === 'admin' ? 'ok' : 'denied');
    } catch (e) { console.error(e); setErr('Could not reach the server. Check your connection and try again.'); setState('login'); }
  }, []);
  useEffect(() => { check(); }, [check]);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; const d = new FormData(e.currentTarget); setBusy(true); setErr('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: String(d.get('email')), password: String(d.get('password')) });
      if (error) { console.error(error); setErr(/fetch|network/i.test(error.message) ? 'Could not reach the server. Check your connection and try again.' : 'Sign-in failed. Check your email and password.'); } else await check();
    } catch (e) { console.error(e); setErr('Could not reach the server. Check your connection and try again.'); }
    setBusy(false);
  }
  async function logout() { await supabase?.auth.signOut(); setState('login'); }
  if (state === 'loading') return <p className="p-10">Checking access...</p>;
  if (state === 'unconfigured') return <p className="p-10">Admin is unavailable: Supabase is not configured.</p>;
  if (state === 'ok') return <><div className="mx-auto flex max-w-6xl justify-end px-4 pt-4"><button className="btn btn-line" onClick={logout}>Sign out</button></div><AdminPanel /></>;
  return (<div className="mx-auto max-w-sm px-4 py-16"><h1 className="text-4xl">Admin sign in</h1>
    {state === 'denied' ? <div className="mt-4"><p role="alert">Admin access required. This account does not have admin permissions.</p><button className="btn btn-line mt-4" onClick={logout}>Sign out</button></div>
      : <form onSubmit={login} className="mt-6 space-y-4"><FormField id="email" label="Email" type="email" required autoComplete="username" /><FormField id="password" label="Password" type="password" required autoComplete="current-password" />
        {err && <p role="alert" className="text-sm text-red-800">{err}</p>}<button className="btn btn-dark" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button></form>}</div>);
}
