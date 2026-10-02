import type { InputHTMLAttributes } from 'react';
export default function FormField({ id, label, error, ...p }: { id: string; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (<div><label htmlFor={id} className="text-sm">{label}</label>
    <input id={id} name={id} maxLength={120} className="field" aria-invalid={!!error} {...p} />
    {error && <p role="alert" className="text-xs text-red-800">{error}</p>}</div>);
}
