import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { categories } from '../data/demo';
import { useProducts } from '../lib/useProducts';
import { usePageTitle } from '../lib/usePublic';
import Testimonials from '../components/Testimonials';
import ProductCard from '../components/ProductCard';
export default function Home() {
  usePageTitle('');
  const { products } = useProducts(); const featured = products.filter(p => p.featured); const shown = (featured.length ? featured : products).slice(0, 4);
  return (<>
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2">
      <div className="rise">
        <h1 className="text-5xl leading-tight text-plum md:text-7xl">{SITE.brand}</h1>
        <p className="mt-4 max-w-md text-lg">{SITE.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/collections" className="btn btn-dark">Explore Collection</Link>
          <Link to="/book" className="btn btn-line">Book Appointment</Link>
        </div>
      </div>
      <img src="https://picsum.photos/seed/srhero/800/1000" alt="Featured boutique outfit" className="aspect-[4/5] w-full object-cover" />
    </section>
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-4xl">Collections</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {categories.map(c => <li key={c}><Link to={`/collections?cat=${encodeURIComponent(c)}`} className="block border border-line p-6 font-display text-2xl hover:border-gold">{c}</Link></li>)}
      </ul>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-4xl">Featured pieces</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{shown.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </section>
    <Testimonials />
  </>);
}
