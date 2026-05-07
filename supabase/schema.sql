-- AI Artisan launch schema
-- Run in Supabase SQL editor or with: supabase db push

create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'artisan', 'admin');
create type public.verification_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.store_status as enum ('draft', 'pending', 'active', 'rejected', 'suspended');
create type public.product_status as enum ('draft', 'pending', 'active', 'rejected', 'archived');
create type public.order_status as enum ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  name text,
  role public.user_role not null default 'customer',
  phone text,
  avatar_url text,
  craft_type text,
  region text,
  bio text,
  profile_photo text,
  artisan_status public.verification_status default 'pending',
  store_setup boolean not null default false,
  store_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_digits check (phone is null or phone ~ '^[0-9]{10,15}$'),
  constraint artisan_fields_when_artisan check (role <> 'artisan' or artisan_status is not null)
);

create table public.artisan_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  craft_type text not null,
  region text not null,
  bio text,
  verification_status public.verification_status not null default 'pending',
  verification_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  status public.store_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  artisan_name text,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null default 'General',
  region text,
  image_url text,
  ai_generated boolean not null default false,
  status public.product_status not null default 'pending',
  inventory_count integer not null default 0 check (inventory_count >= 0),
  views integer not null default 0 check (views >= 0),
  orders integer not null default 0 check (orders >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
  status public.order_status not null default 'pending',
  subtotal numeric(10,2) not null default 0 check (subtotal >= 0),
  shipping_amount numeric(10,2) not null default 0 check (shipping_amount >= 0),
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  customer_email text not null,
  customer_name text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  artisan_id uuid references public.profiles(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.profiles(id) on delete cascade,
  prompt text,
  craft_type text,
  style text,
  image_urls text[],
  selected_index int not null default 0,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_artisan_status_idx on public.profiles(artisan_status) where role = 'artisan';
create index stores_artisan_idx on public.stores(artisan_id);
create index stores_status_idx on public.stores(status);
create index products_artisan_idx on public.products(artisan_id);
create index products_store_idx on public.products(store_id);
create index products_status_created_idx on public.products(status, created_at desc);
create index orders_customer_idx on public.orders(customer_id);
create index order_items_order_idx on public.order_items(order_id);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger artisan_profiles_touch_updated_at before update on public.artisan_profiles for each row execute function public.touch_updated_at();
create trigger stores_touch_updated_at before update on public.stores for each row execute function public.touch_updated_at();
create trigger products_touch_updated_at before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch_updated_at before update on public.orders for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer');
  requested_name text := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
begin
  if requested_role = 'admin' then
    requested_role := 'customer';
  end if;

  insert into public.profiles (id, email, full_name, name, role)
  values (new.id, new.email, requested_name, requested_name, requested_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.artisan_profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.designs enable row level security;

create policy profiles_select_public on public.profiles for select using (true);
create policy profiles_insert_self on public.profiles for insert with check (auth.uid() = id and role <> 'admin');
create policy profiles_update_self on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role <> 'admin');
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy artisan_profiles_select_public on public.artisan_profiles for select using (true);
create policy artisan_profiles_owner_write on public.artisan_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy artisan_profiles_admin_all on public.artisan_profiles for all using (public.is_admin()) with check (public.is_admin());

create policy stores_select_public on public.stores for select using (status = 'active' or artisan_id = auth.uid() or public.is_admin());
create policy stores_owner_insert on public.stores for insert with check (auth.uid() = artisan_id);
create policy stores_owner_update on public.stores for update using (auth.uid() = artisan_id) with check (auth.uid() = artisan_id);
create policy stores_admin_all on public.stores for all using (public.is_admin()) with check (public.is_admin());

create policy products_select_public on public.products for select using (status = 'active' or artisan_id = auth.uid() or public.is_admin());
create policy products_owner_insert on public.products for insert with check (auth.uid() = artisan_id);
create policy products_owner_update on public.products for update using (auth.uid() = artisan_id) with check (auth.uid() = artisan_id);
create policy products_owner_delete on public.products for delete using (auth.uid() = artisan_id);
create policy products_admin_all on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy orders_customer_select on public.orders for select using (customer_id = auth.uid() or public.is_admin());
create policy orders_customer_insert on public.orders for insert with check (customer_id = auth.uid() or customer_id is null);
create policy orders_admin_all on public.orders for all using (public.is_admin()) with check (public.is_admin());

create policy order_items_related_select on public.order_items for select using (
  public.is_admin()
  or artisan_id = auth.uid()
  or exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = auth.uid())
);
create policy order_items_customer_insert on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or orders.customer_id is null))
);
create policy order_items_admin_all on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy designs_owner_all on public.designs for all using (auth.uid() = artisan_id or public.is_admin()) with check (auth.uid() = artisan_id or public.is_admin());
