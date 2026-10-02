import { testimonials as demo, type Testimonial } from '../data/demo';
import { usePublic } from '../lib/usePublic';
export const Stars = ({ n }: { n: number }) => <span role="img" aria-label={`${n} out of 5`} className="text-gold">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
export default function Testimonials() {
  const { rows, loading } = usePublic<Testimonial>('testimonials', demo);
  const list = rows.filter(t => t.enabled !== false);
  if (!loading && list.length === 0) return null;
  return (<section className="mx-auto max-w-6xl px-4 py-12"><h2 className="text-4xl">Customer reviews</h2>
    {loading ? <p className="mt-6">Loading reviews...</p> : <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {list.map(t => <li key={t.id} className="border border-line bg-white p-5"><Stars n={t.rating} /><p className="mt-2">{t.review}</p>
        <p className="mt-3 text-sm">{t.name}{t.created_at && ` · ${new Date(t.created_at).toLocaleDateString('en-IN')}`}</p></li>)}</ul>}
  </section>);
}
