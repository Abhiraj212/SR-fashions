create table profiles (id uuid primary key references auth.users on delete cascade, role text not null default 'customer', created_at timestamptz default now());
create table categories (id serial primary key, name text unique not null);
create table products (id uuid primary key default gen_random_uuid(), category_id int references categories, name text not null, price numeric not null, description text, colors text[], sizes text[], images text[], available boolean default true, featured boolean default false, created_at timestamptz default now());
create table services (id serial primary key, title text not null, description text, active boolean default true);
create table customers (id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, created_at timestamptz default now());
create table appointments (id uuid primary key default gen_random_uuid(), customer_id uuid references customers, name text not null, phone text not null, email text, service text, preferred_date date, preferred_time time, message text, status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')), created_at timestamptz default now());
create table measurements (id uuid primary key default gen_random_uuid(), customer_id uuid references customers, data jsonb not null, created_at timestamptz default now());
create table gallery (id uuid primary key default gen_random_uuid(), title text, category text, image_url text not null, featured boolean default false, created_at timestamptz default now());
create table testimonials (id uuid primary key default gen_random_uuid(), name text not null, rating int check (rating between 1 and 5), review text, enabled boolean default true, created_at timestamptz default now());
create table enquiries (id uuid primary key default gen_random_uuid(), name text, phone text, message text, product_id uuid references products, created_at timestamptz default now());
create table site_settings (key text primary key, value jsonb);
create function is_admin() returns boolean language sql security definer set search_path = public as $$ select exists(select 1 from profiles where id = auth.uid() and role = 'admin') $$;
do $$ declare t text; begin foreach t in array array['profiles','categories','products','services','customers','appointments','measurements','gallery','testimonials','enquiries','site_settings'] loop
  execute format('alter table %I enable row level security', t);
  execute format('create policy "admin all" on %I for all using (is_admin()) with check (is_admin())', t);
end loop; end $$;
create policy "public read" on products for select using (true);
create policy "public read" on categories for select using (true);
create policy "public read" on services for select using (active);
create policy "public read" on gallery for select using (true);
create policy "public read" on testimonials for select using (enabled);
create policy "public insert" on appointments for insert with check (status = 'pending' and customer_id is null);
create policy "public insert" on enquiries for insert with check (length(coalesce(message, '')) < 5000);
alter table enquiries add column if not exists email text;
create policy "public insert" on measurements for insert with check (customer_id is null and pg_column_size(data) < 4000); -- no public select: admins only
insert into categories (name) values ('Sarees'),('Suits'),('Lehengas'),('Blouses'),('Bridal'),('Custom Designs') on conflict do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('media','media',true,5242880,array['image/jpeg','image/png','image/webp','image/gif']) on conflict do nothing;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "admin write media" on storage.objects for all using (bucket_id = 'media' and is_admin()) with check (bucket_id = 'media' and is_admin());
