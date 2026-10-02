// Demo data. Replace with Supabase queries in a service layer later.
export type Product = { id: string; name: string; category: string; price: number; available: boolean; colors: string[]; sizes: string[]; description: string; image: string; images: string[]; featured?: boolean };
export type ServiceItem = { title: string; description: string; image: string; cta: 'book' | 'measure' | 'whatsapp' };
export const serviceItems: ServiceItem[] = [
  ['Custom Stitching', 'Outfits made to your measurements.', 'book'], ['Blouse Designing', 'Customised blouse designs and necklines.', 'book'],
  ['Alterations', 'Fitting and alteration of your existing outfits.', 'whatsapp'], ['Bridal Wear', 'Customised bridal outfits planned with you.', 'book'],
  ['Personal Styling', 'Help choosing and styling outfits.', 'book'], ['Measurements', 'Share your measurements with us online.', 'measure'],
].map(([title, description, cta], i) => ({ title, description, cta: cta as ServiceItem['cta'], image: `https://picsum.photos/seed/srs${i}/600/400` }));
export const categories = ['Sarees', 'Suits', 'Lehengas', 'Blouses', 'Bridal', 'Custom Designs'];
const rows: [string, string, number, boolean][] = [
  ['Banarasi Silk Saree', 'Sarees', 8500, true], ['Chanderi Cotton Saree', 'Sarees', 3200, true],
  ['Anarkali Suit Set', 'Suits', 4800, true], ['Straight Cut Suit', 'Suits', 3600, false],
  ['Festive Lehenga', 'Lehengas', 14500, true], ['Pastel Lehenga', 'Lehengas', 12000, true],
  ['Designer Back-Neck Blouse', 'Blouses', 1800, true], ['Embroidered Blouse', 'Blouses', 2400, true],
  ['Bridal Lehenga', 'Bridal', 38000, true], ['Bridal Saree', 'Bridal', 24000, false],
  ['Made-to-Measure Outfit', 'Custom Designs', 5000, true], ['Custom Blouse Design', 'Custom Designs', 2200, true],
];
export const products: Product[] = rows.map(([name, category, price, available], i) => ({
  id: String(i + 1), name, category, price, available,
  colors: ['Maroon', 'Ivory', 'Emerald'], sizes: ['S', 'M', 'L', 'XL', 'Custom'],
  description: `${name}, available as ready piece or made to your measurements. Ask us about fabrics, colours and fitting.`,
  image: `https://picsum.photos/seed/srf${i + 1}/600/800`, featured: i < 4,
  images: [0, 1, 2].map(n => `https://picsum.photos/seed/srf${i + 1}-${n}/600/800`),
}));
export const services = serviceItems.map(s => s.title);
export const galleryCategories = ['All', 'Bridal', 'Sarees', 'Lehengas', 'Blouses', 'Boutique', 'Custom Designs'];
export type GalleryItem = { id: string; title: string; category: string; image_url: string; featured?: boolean };
export const gallery: GalleryItem[] = galleryCategories.slice(1).map((category, i) => ({ id: 'g' + i, title: `${category} (demo image)`, category, image_url: `https://picsum.photos/seed/srg${i}/800/${i % 2 ? 1000 : 800}` }));
export type Testimonial = { id: string; name: string; rating: number; review: string; enabled?: boolean; created_at?: string };
export const testimonials: Testimonial[] = [5, 5, 4, 5].map((rating, i) => ({ id: 't' + i, name: `Demo reviewer ${i + 1}`, rating, review: 'Demo testimonial for development. Replace in admin.' }));
