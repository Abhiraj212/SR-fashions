import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { usePageTitle } from '../lib/usePublic';
import { waLink, msgs } from '../lib/whatsapp';
const blocks = [
  ['Our story', `${SITE.brand} is the label of ${SITE.boutique}, a boutique for sarees, suits, lehengas, blouses and made-to-measure outfits.`],
  ['Craftsmanship', 'Every outfit is cut and stitched with attention to fit and finish.'],
  ['Customisation', 'Choose a design, fabric and measurements, or bring your own idea.'],
  ['Customer experience', 'Visit the boutique, talk through your outfit and share measurements in person or online.'],
];
export default function About() {
  usePageTitle('About', 'About SR Fashions and Seema Boutique: our story, craftsmanship and customisation.');
  return (<div className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-5xl text-plum">About {SITE.boutique}</h1>
    <p className="mt-4 max-w-2xl text-lg">{SITE.brand} brings sarees, suits, lehengas, blouses and made-to-measure outfits together under one roof.</p>
    <div className="mt-10 grid gap-8 md:grid-cols-2">{blocks.map(([t, d], i) => <section key={t} className="grid gap-3">
      <img src={`https://picsum.photos/seed/sra${i}/700/450`} alt={t} loading="lazy" className="aspect-[14/9] w-full object-cover" />
      <h2 className="text-3xl">{t}</h2><p>{d}</p></section>)}</div>
    <div className="mt-12 flex flex-wrap gap-3"><Link to="/book" className="btn btn-dark">Book Appointment</Link>
      <a className="btn btn-line" href={waLink(msgs.general())} target="_blank" rel="noreferrer">WhatsApp us</a></div>
  </div>);
}
