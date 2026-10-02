import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { galleryCategories } from '../../data/demo';
import CrudManager, { type Field } from './CrudManager';
import RecordList from './RecordList';
import Overview from './Overview';
import AppointmentsAdmin from './AppointmentsAdmin';
const tabs = ['Overview', 'Products', 'Appointments', 'Enquiries', 'Measurements', 'Gallery', 'Testimonials'];
const galleryFields: Field[] = [{ key: 'title', label: 'Title', type: 'text', required: true }, { key: 'category', label: 'Category', type: 'select', required: true, options: galleryCategories.slice(1).map(c => [c, c]) },
  { key: 'image_url', label: 'Image URL', type: 'text', required: true, upload: true }, { key: 'featured', label: 'Featured', type: 'checkbox' }];
const testimonialFields: Field[] = [{ key: 'name', label: 'Customer name', type: 'text', required: true }, { key: 'rating', label: 'Rating', type: 'select', num: true, required: true, options: [1, 2, 3, 4, 5].map(n => [String(n), `${n} stars`]) },
  { key: 'review', label: 'Review', type: 'textarea', required: true }, { key: 'enabled', label: 'Show on website', type: 'checkbox' }];
export default function AdminPanel() {
  const [tab, setTab] = useState(tabs[0]); const [cats, setCats] = useState<[string, string][]>([]);
  useEffect(() => { supabase?.from('categories').select('id,name').then(({ data }) => setCats((data ?? []).map(c => [String(c.id), c.name]))); }, []);
  const productFields: Field[] = [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'category_id', label: 'Category', type: 'select', num: true, required: true, options: cats },
    { key: 'price', label: 'Price (₹)', type: 'number', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'colors', label: 'Colours', type: 'list' }, { key: 'sizes', label: 'Sizes', type: 'list' },
    { key: 'images', label: 'Image URLs', type: 'list', upload: true }, { key: 'available', label: 'Available', type: 'checkbox' }, { key: 'featured', label: 'Featured', type: 'checkbox' }];
  return (<div className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-5xl">Admin</h1>
    <div className="mt-6 flex flex-wrap gap-2" role="tablist">{tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-dark' : 'btn-line'}`}>{t}</button>)}</div>
    <div className="mt-8">
      {tab === 'Overview' && <Overview />}
      {tab === 'Enquiries' && <RecordList table="enquiries" title="Enquiries" summary={r => `${r.name} · ${r.phone}`} detail={r => [r.email, r.message]} />}
      {tab === 'Measurements' && <RecordList table="measurements" title="Measurements" summary={r => `${r.data?.name} · ${r.data?.outfit} · ${r.data?.phone}`} detail={r => Object.entries(r.data ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)} />}
      {tab === 'Products' && <CrudManager table="products" title="Products" fields={productFields} defaults={{ available: true, featured: false, price: '' }} summary={r => `${r.name} · ₹${r.price}${r.available ? '' : ' · unavailable'}`} />}
      {tab === 'Appointments' && <AppointmentsAdmin />}
      {tab === 'Gallery' && <CrudManager table="gallery" title="Gallery" fields={galleryFields} defaults={{ featured: false }} summary={r => `${r.title} · ${r.category}`} />}
      {tab === 'Testimonials' && <CrudManager table="testimonials" title="Testimonials" fields={testimonialFields} defaults={{ rating: 5, enabled: true }} summary={r => `${r.name} · ${r.rating}★ · ${r.enabled ? 'shown' : 'hidden'}`} />}
    </div></div>);
}
