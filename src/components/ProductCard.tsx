import { Link } from 'react-router-dom';
import type { Product } from '../data/demo';
export default function ProductCard({ p }: { p: Product }) {
  return (<article>
    <Link to={`/product/${p.id}`}>
      <img src={p.image} alt={p.name} loading="lazy" width={600} height={800} className="aspect-[3/4] w-full object-cover" />
      <h3 className="mt-3 text-xl">{p.name}</h3>
    </Link>
    <p className="text-sm text-ink/70">{p.category} · ₹{p.price.toLocaleString('en-IN')}</p>
    <p className={`text-xs ${p.available ? 'text-emerald-800' : 'text-red-800'}`}>{p.available ? 'Available' : 'Made to order'}</p>
  </article>);
}
