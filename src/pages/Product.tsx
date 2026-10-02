import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../lib/useProducts';
import { usePageTitle } from '../lib/usePublic';
import { waLink, msgs } from '../lib/whatsapp';
export default function Product() {
  const { id } = useParams(); const { products, loading } = useProducts(); const [sel, setSel] = useState(0);
  const p = products.find(x => x.id === id);
  usePageTitle(p?.name ?? 'Product', p?.description.slice(0, 150));
  if (loading) return <p className="p-10">Loading...</p>;
  if (!p) return <p className="p-10">Product not found. <Link className="underline" to="/collections">Back to collections</Link></p>;
  return (<div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
    <div><img src={p.images[sel] ?? p.image} alt={`${p.name}, view ${sel + 1}`} className="w-full object-cover" />
      {p.images.length > 1 && <ul className="mt-3 grid grid-cols-4 gap-2">{p.images.map((src, i) => <li key={src}>
        <button onClick={() => setSel(i)} aria-label={`Show image ${i + 1}`} aria-pressed={sel === i} className={`block w-full border-2 ${sel === i ? 'border-gold' : 'border-transparent'}`}><img src={src} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" /></button></li>)}</ul>}</div>
    <div>
      <p className="text-sm">{p.category}</p><h1 className="text-5xl">{p.name}</h1>
      <p className="mt-2 text-2xl">₹{p.price.toLocaleString('en-IN')}</p><p className="mt-4">{p.description}</p>
      {p.colors.length > 0 && <p className="mt-4 text-sm">Colours: {p.colors.join(', ')}</p>}{p.sizes.length > 0 && <p className="text-sm">Sizes: {p.sizes.join(', ')}</p>}
      <p className="mt-2 text-sm">{p.available ? 'Available now' : 'Made to order'} · Customisation and measurements on request</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a className="btn btn-dark" target="_blank" rel="noreferrer" href={waLink(msgs.product(p.name))}>Enquire on WhatsApp</a>
        <Link className="btn btn-line" to="/book">Book Appointment</Link>
        <Link className="btn btn-line" to="/measurements">Share measurements</Link>
      </div>
    </div>
  </div>);
}
