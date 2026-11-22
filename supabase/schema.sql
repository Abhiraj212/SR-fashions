-- SR Fashions core schema. Safe to apply to a new, empty project.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text, phone text,
 role text not null default 'customer' check(role in ('owner','admin','staff','customer')),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create or replace function private.has_any_role(required_roles text[])
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role=any(required_roles)); $$;
revoke all on function private.has_any_role(text[]) from public, anon;
grant execute on function private.has_any_role(text[]) to authenticated;
create or replace function private.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path=''
as $$ begin insert into public.profiles(id,display_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',''),'customer') on conflict(id) do nothing; return new; end; $$;
revoke all on function private.create_profile_for_auth_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute function private.create_profile_for_auth_user();

create table public.customers(id uuid primary key default gen_random_uuid(),full_name text not null,phone text not null,alternate_phone text,address text,notes text,created_by uuid references public.profiles(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.measurements(id uuid primary key default gen_random_uuid(),customer_id uuid not null references public.customers(id) on delete cascade,garment_type text not null check(garment_type in ('suit','shirt','pant','blouse','kurti','other')),label text,values jsonb not null default '{}'::jsonb,notes text,recorded_by uuid references public.profiles(id),created_at timestamptz not null default now());
create table public.staff_profiles(user_id uuid primary key references public.profiles(id) on delete cascade,job_title text,pay_type text not null default 'per_order' check(pay_type in ('per_order','monthly','daily')),default_rate numeric(12,2) not null default 0 check(default_rate>=0),active boolean not null default true,joined_on date,notes text);
create table public.orders(id uuid primary key default gen_random_uuid(),order_number text not null unique,customer_id uuid not null references public.customers(id),due_date date,status text not null default 'pending' check(status in ('pending','cutting','stitching','ready','delivered','cancelled')),total_amount numeric(12,2) not null default 0 check(total_amount>=0),discount_amount numeric(12,2) not null default 0 check(discount_amount>=0),notes text,created_by uuid references public.profiles(id),assigned_staff_id uuid references public.profiles(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(discount_amount<=total_amount));
create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,garment_type text not null,description text,quantity integer not null default 1 check(quantity>0),unit_price numeric(12,2) not null default 0 check(unit_price>=0),measurement_id uuid references public.measurements(id) on delete set null);
create table public.order_status_history(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,old_status text,new_status text not null,note text,changed_by uuid references public.profiles(id),changed_at timestamptz not null default now());
create table public.payments(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,amount numeric(12,2) not null check(amount>0),method text not null default 'cash' check(method in ('cash','upi','bank','other')),note text,paid_at timestamptz not null default now(),recorded_by uuid references public.profiles(id));
create table public.staff_assignments(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,staff_user_id uuid not null references public.profiles(id),task text,assigned_by uuid references public.profiles(id),assigned_at timestamptz not null default now());
create table public.staff_payments(id uuid primary key default gen_random_uuid(),staff_user_id uuid not null references public.profiles(id),amount numeric(12,2) not null check(amount>0),note text,paid_at timestamptz not null default now(),recorded_by uuid references public.profiles(id));
create table public.expenses(id uuid primary key default gen_random_uuid(),category text not null,amount numeric(12,2) not null check(amount>0),description text,expense_date date not null default current_date,recorded_by uuid references public.profiles(id),created_at timestamptz not null default now());
create table public.business_settings(key text primary key,value jsonb not null default '{}'::jsonb,updated_by uuid references public.profiles(id),updated_at timestamptz not null default now());

alter table public.profiles enable row level security;
create policy profiles_read_self on public.profiles for select to authenticated using(id=(select auth.uid()) or (select private.has_any_role(array['owner','admin'])));
create policy profiles_update_self on public.profiles for update to authenticated using(id=(select auth.uid()) or (select private.has_any_role(array['owner','admin']))) with check(id=(select auth.uid()) or (select private.has_any_role(array['owner','admin'])));

do $$ declare t text; begin foreach t in array array['customers','measurements','staff_profiles','orders','order_items','order_status_history','payments','staff_assignments','staff_payments','expenses','business_settings'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;

create policy customers_select on public.customers for select to authenticated using((select private.has_any_role(array['owner','admin','staff'])));
create policy customers_insert on public.customers for insert to authenticated with check((select private.has_any_role(array['owner','admin'])));
create policy customers_update on public.customers for update to authenticated using((select private.has_any_role(array['owner','admin']))) with check((select private.has_any_role(array['owner','admin'])));
create policy customers_delete on public.customers for delete to authenticated using((select private.has_any_role(array['owner','admin'])));
create policy measurements_select on public.measurements for select to authenticated using((select private.has_any_role(array['owner','admin','staff'])));
create policy measurements_insert on public.measurements for insert to authenticated with check((select private.has_any_role(array['owner','admin'])));
create policy measurements_update on public.measurements for update to authenticated using((select private.has_any_role(array['owner','admin']))) with check((select private.has_any_role(array['owner','admin'])));
create policy measurements_delete on public.measurements for delete to authenticated using((select private.has_any_role(array['owner','admin'])));
create policy orders_select on public.orders for select to authenticated using((select private.has_any_role(array['owner','admin','staff'])));
create policy orders_insert on public.orders for insert to authenticated with check((select private.has_any_role(array['owner','admin'])));
create policy orders_update on public.orders for update to authenticated using((select private.has_any_role(array['owner','admin']))) with check((select private.has_any_role(array['owner','admin'])));
create policy orders_delete on public.orders for delete to authenticated using((select private.has_any_role(array['owner','admin'])));
create policy order_items_select on public.order_items for select to authenticated using((select private.has_any_role(array['owner','admin','staff'])));
create policy order_items_insert on public.order_items for insert to authenticated with check((select private.has_any_role(array['owner','admin'])));
create policy order_items_update on public.order_items for update to authenticated using((select private.has_any_role(array['owner','admin']))) with check((select private.has_any_role(array['owner','admin'])));
create policy order_items_delete on public.order_items for delete to authenticated using((select private.has_any_role(array['owner','admin'])));
create policy order_status_history_select on public.order_status_history for select to authenticated using((select private.has_any_role(array['owner','admin','staff'])));
create policy order_status_history_insert on public.order_status_history for insert to authenticated with check((select private.has_any_role(array['owner','admin'])));
create policy order_status_history_update on public.order_status_history for update to authenticated using((select private.has_any_role(array['owner','admin']))) with check((select private.has_any_role(array['owner','admin'])));
create policy order_status_history_delete on public.order_status_history for delete to authenticated using((select private.has_any_role(array['owner','admin'])));
do $$ declare t text; begin foreach t in array array['staff_profiles','payments','staff_assignments','staff_payments','expenses','business_settings'] loop execute format('create policy %I on public.%I for all to authenticated using((select private.has_any_role(array[''owner'',''admin'']))) with check((select private.has_any_role(array[''owner'',''admin''])))',t||'_owner_admin_all',t); end loop; end $$;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,phone) on public.profiles to authenticated;
grant select,insert,update,delete on public.customers,public.measurements,public.staff_profiles,public.orders,public.order_items,public.order_status_history,public.payments,public.staff_assignments,public.staff_payments,public.expenses,public.business_settings to authenticated;

create index customers_phone_idx on public.customers(phone);
create index customers_created_by_idx on public.customers(created_by);
create index measurements_customer_idx on public.measurements(customer_id,created_at desc);
create index measurements_recorded_by_idx on public.measurements(recorded_by);
create index staff_profiles_user_id_idx on public.staff_profiles(user_id);
create index orders_customer_idx on public.orders(customer_id);
create index orders_due_status_idx on public.orders(due_date,status);
create index orders_created_by_idx on public.orders(created_by);
create index orders_assigned_staff_idx on public.orders(assigned_staff_id);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_measurement_idx on public.order_items(measurement_id);
create index order_history_idx on public.order_status_history(order_id,changed_at desc);
create index order_history_changed_by_idx on public.order_status_history(changed_by);
create index payments_order_idx on public.payments(order_id,paid_at desc);
create index payments_recorded_by_idx on public.payments(recorded_by);
create index staff_assignments_order_idx on public.staff_assignments(order_id);
create index staff_assignments_user_idx on public.staff_assignments(staff_user_id);
create index staff_assignments_assigned_by_idx on public.staff_assignments(assigned_by);
create index staff_payments_user_idx on public.staff_payments(staff_user_id);
create index staff_payments_recorded_by_idx on public.staff_payments(recorded_by);
create index expenses_recorded_by_idx on public.expenses(recorded_by);
create index business_settings_updated_by_idx on public.business_settings(updated_by);
