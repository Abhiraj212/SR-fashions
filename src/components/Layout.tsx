import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { SITE } from '../config/site';
import { waLink, msgs } from '../lib/whatsapp';
const links: [string, string][] = [['/', 'Home'], ['/collections', 'Collections'], ['/services', 'Services'], ['/gallery', 'Gallery'], ['/about', 'About'], ['/contact', 'Contact'], ['/book', 'Book Appointment']];
export default function Layout() {
  const [open, setOpen] = useState(false);
  return (<>
    <header className="sticky top-0 z-20 border-b border-line bg-cream/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4" aria-label="Main">
        <Link to="/" className="font-display text-2xl text-plum">{SITE.brand}</Link>
        <button className="lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
        <div className="hidden items-center gap-5 lg:flex">
          {links.map(([to, l]) => <NavLink key={to} to={to} className="text-sm hover:text-gold">{l}</NavLink>)}
          <a className="btn btn-line" href={waLink(msgs.general())} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </nav>
      <div className={`grid overflow-hidden transition-all duration-300 lg:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden"><div className="flex flex-col gap-3 px-4 pb-4">
          {links.map(([to, l]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{l}</Link>)}
        </div></div>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="mt-24 bg-plum px-4 py-10 text-cream">
      <div className="mx-auto max-w-6xl text-sm">
        <p className="font-display text-2xl">{SITE.brand}</p><p>{SITE.boutique}</p>
        <p className="mt-3">{[SITE.address, SITE.phone, SITE.email].filter(Boolean).join(' · ')}</p>{SITE.hours && <p>{SITE.hours}</p>}
        <p className="mt-6 opacity-70">© {new Date().getFullYear()} {SITE.brand}</p>
      </div>
    </footer></>);
}
