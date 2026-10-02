import { useCallback, useEffect, useState } from 'react';
import { galleryCategories, gallery as demo, type GalleryItem } from '../data/demo';
import { usePublic, usePageTitle } from '../lib/usePublic';
export default function Gallery() {
  usePageTitle('Gallery', 'A look at bridal wear, sarees, lehengas, blouses and custom designs.');
  const { rows, loading } = usePublic<GalleryItem>('gallery', demo);
  const [cat, setCat] = useState('All'); const [open, setOpen] = useState<number | null>(null);
  const list = rows.filter(g => cat === 'All' || g.category === cat);
  const step = useCallback((d: number) => setOpen(i => i === null || !list.length ? i : (i + d + list.length) % list.length), [list.length]);
  useEffect(() => { if (open === null) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' ? setOpen(null) : e.key === 'ArrowRight' ? step(1) : e.key === 'ArrowLeft' ? step(-1) : null;
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, step]);
  const cur = open === null ? null : list[open];
  return (<div className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-5xl text-plum">Gallery</h1>
    <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">{galleryCategories.map(c =>
      <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={`btn ${cat === c ? 'btn-dark' : 'btn-line'}`}>{c}</button>)}</div>
    {loading ? <p className="mt-8">Loading gallery...</p> : list.length === 0 ? <p className="mt-8">No images in this category yet.</p> :
      <ul className="mt-8 columns-2 gap-3 md:columns-3">{list.map((g, i) => <li key={g.id} className="mb-3 break-inside-avoid">
        <button onClick={() => setOpen(i)} className="block w-full" aria-label={`View ${g.title}`}><img src={g.image_url} alt={g.title} loading="lazy" className="w-full object-cover" /></button></li>)}</ul>}
    {cur && <div role="dialog" aria-modal="true" aria-label={cur.title} className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-ink/90 p-4" onClick={() => setOpen(null)}>
      <img src={cur.image_url} alt={cur.title} className="max-h-[75vh] max-w-full object-contain" onClick={e => e.stopPropagation()} />
      <p className="mt-3 text-cream">{cur.title}</p>
      <div className="mt-3 flex gap-3" onClick={e => e.stopPropagation()}>
        <button className="btn btn-line text-cream" onClick={() => step(-1)}>Previous</button>
        <button className="btn btn-line text-cream" autoFocus onClick={() => setOpen(null)}>Close</button>
        <button className="btn btn-line text-cream" onClick={() => step(1)}>Next</button></div></div>}
  </div>);
}
