import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories } from '../data/demo';
import { usePageTitle } from '../lib/usePublic';
import { useProducts } from '../lib/useProducts';
import ProductCard from '../components/ProductCard';
export default function Collections() {
  usePageTitle('Collections', 'Browse sarees, suits, lehengas, blouses, bridal wear and custom designs.');
  const { products, loading } = useProducts();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(''); const [max, setMax] = useState(10000000); const [sort, setSort] = useState('new');
  const cat = sp.get('cat') ?? '';
  const list = useMemo(() => {
    const r = products.filter(p => (!cat || p.category === cat) && p.price <= max && p.name.toLowerCase().includes(q.toLowerCase()));
    return sort === 'low' ? [...r].sort((a, b) => a.price - b.price) : sort === 'high' ? [...r].sort((a, b) => b.price - a.price) : r;
  }, [products, cat, q, max, sort]);
  return (<div className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-5xl">Collections</h1>
    <div className="mt-6 grid gap-3 md:grid-cols-4">
      <label className="sr-only" htmlFor="s">Search</label><input id="s" className="field" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
      <label className="sr-only" htmlFor="c">Category</label>
      <select id="c" className="field" value={cat} onChange={e => setSp(e.target.value ? { cat: e.target.value } : {})}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
      <label className="sr-only" htmlFor="m">Max price</label>
      <select id="m" className="field" value={max} onChange={e => setMax(+e.target.value)}><option value={5000}>Up to ₹5,000</option><option value={15000}>Up to ₹15,000</option><option value={10000000}>Any price</option></select>
      <label className="sr-only" htmlFor="o">Sort</label>
      <select id="o" className="field" value={sort} onChange={e => setSort(e.target.value)}><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
    </div>
    {loading ? <p className="mt-10">Loading collection...</p> : list.length === 0 ? <p className="mt-10">No pieces match these filters. Clear the search or widen the price range.</p>
      : <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>}
  </div>);
}
