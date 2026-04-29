-- profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'artisan' check (role in ('artisan', 'buyer', 'admin')),
  craft_type text,
  region text,
  bio text,
  store_setup boolean default false,
  store_slug text unique,
  profile_photo text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  artisan_id uuid references auth.users(id) on delete cascade not null,
  artisan_name text not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  region text,
  image_url text,
  ai_generated boolean default false,
  status text default 'active' check (status in ('active', 'pending', 'rejected')),
  views integer default 0,
  orders integer default 0,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Products policies
create policy "Anyone can view active products"
  on products for select using (status = 'active');
create policy "Artisans can insert own products"
  on products for insert with check (auth.uid() = artisan_id);
create policy "Artisans can update own products"
  on products for update using (auth.uid() = artisan_id);
create policy "Artisans can delete own products"
  on products for delete using (auth.uid() = artisan_id);

-- Auto-update updated_at on profiles
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- designs table
create table public.designs (
  id uuid default gen_random_uuid() primary key,
  artisan_id uuid references auth.users(id) on delete cascade,
  prompt text,
  craft_type text,
  style text,
  image_urls text[],
  selected_index int default 0,
  created_at timestamptz default now()
);

alter table public.designs enable row level security;

create policy "Artisans own their designs"
  on designs for all using (auth.uid() = artisan_id);
