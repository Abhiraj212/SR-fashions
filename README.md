# SR Fashions / Seema Boutique

Vite + React + TypeScript + Tailwind + Supabase. Real Supabase credentials are required for live bookings, enquiries, measurements and admin data. Without them the site still browses demo content, but forms tell visitors the service is not configured and nothing is saved.

## Setup
1. `npm install`
2. Create `.env` (copy `.env.example`).
3. Set `VITE_SUPABASE_URL` (Supabase project URL).
4. Set `VITE_SUPABASE_ANON_KEY` (the public anon key, never the service_role key).
5. Run `supabase/schema.sql` in the Supabase SQL editor (creates tables, RLS policies and the `media` bucket). If you ran an older version, drop the old "public insert" policies first.
6. Create an admin: Authentication > Add user, then run `insert into profiles (id, role) values ('USER-ID','admin') on conflict (id) do update set role='admin';` and sign in at `/admin`.
7. Add business details in `src/config/site.ts` (WhatsApp, phone, email, address, hours, Instagram, Facebook, map URL). Empty values are hidden.
8. `npm run dev`
9. `npm run build`

Before launch: replace `https://example.com` in `public/robots.txt` and `public/sitemap.xml`, and replace the icons in `public/`.
