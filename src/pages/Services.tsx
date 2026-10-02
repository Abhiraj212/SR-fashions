import { Link } from 'react-router-dom';
import { serviceItems } from '../data/demo';
import { usePageTitle } from '../lib/usePublic';
import { waLink, msgs } from '../lib/whatsapp';
export default function Services() {
  usePageTitle('Services', 'Custom stitching, blouse designing, alterations, bridal wear, styling and measurements.');
  return (<div className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-5xl text-plum">Services</h1>
    <ul className="mt-8 grid gap-6 md:grid-cols-3">{serviceItems.map(s => <li key={s.title} className="border border-line bg-white">
      <img src={s.image} alt={s.title} loading="lazy" className="aspect-[3/2] w-full object-cover" />
      <div className="p-5"><h2 className="text-2xl">{s.title}</h2><p className="mt-2 text-sm">{s.description}</p>
        <div className="mt-4">{s.cta === 'book' && <Link className="btn btn-dark" to="/book">Book Appointment</Link>}
          {s.cta === 'measure' && <Link className="btn btn-dark" to="/measurements">Share measurements</Link>}
          {s.cta === 'whatsapp' && <a className="btn btn-dark" target="_blank" rel="noreferrer" href={waLink(msgs.general())}>Ask on WhatsApp</a>}</div></div></li>)}</ul></div>);
}
