import { useEffect, useState } from 'react';
import { products as demo, type Product } from '../data/demo';
import { supabase } from './supabase';
const PLACEHOLDER = 'https://picsum.photos/seed/srf-none/600/800';
// Reads products from Supabase; uses demo data only when Supabase is not configured or the request fails.
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(demo); const [loading, setLoading] = useState(!!supabase);
  useEffect(() => { if (!supabase) return; let on = true;
    supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }).then(({ data, error }) => { if (!on) return;
      if (!error && data) setProducts(data.map((r: any): Product => { const images: string[] = r.images?.length ? r.images : [PLACEHOLDER];
        return { id: r.id, name: r.name, category: r.categories?.name ?? 'Uncategorised', price: Number(r.price), available: !!r.available, featured: !!r.featured, colors: r.colors ?? [], sizes: r.sizes ?? [], description: r.description ?? '', images, image: images[0] }; }));
      setLoading(false); });
    return () => { on = false; }; }, []);
  return { products, loading };
}
