create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  role text default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  story_title text,
  bible_reference text,
  scripture_quote text,
  tagline text,
  description text,
  lid_image_url text,
  figure_image_url text,
  model_3d_url text,
  is_published boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id) on delete set null,
  name text,
  price numeric(10,2) default 0,
  currency text default 'GBP',
  stock_qty integer default 0,
  includes jsonb default '[]'::jsonb,
  is_customisable boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount numeric(10,2),
  currency text default 'GBP',
  payment_method text,
  payment_intent_id text,
  is_gift boolean default false,
  gift_message text,
  shipping_name text,
  shipping_address jsonb,
  tracking_number text,
  tracking_url text,
  estimated_delivery date,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer default 1 check (quantity > 0),
  unit_price numeric(10,2),
  customisation jsonb
);

create table if not exists public.community_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  character_name text,
  story_title text,
  story_content text,
  bible_reference text,
  submitted_image_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz default now()
);

create index if not exists characters_published_idx on public.characters(is_published);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_character_id_idx on public.products(character_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists community_stories_status_idx on public.community_stories(status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.community_stories enable row level security;
alter table public.contact_messages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Public can read published characters"
on public.characters for select
using (is_published = true or public.is_admin());

create policy "Admins manage characters"
on public.characters for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active products"
on public.products for select
using (is_active = true or public.is_admin());

create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users read own profile"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "Users update own profile"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "Users read own orders"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

create policy "Admins manage orders"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users read own order items"
on public.order_items for select
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and (orders.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Admins manage order items"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved stories"
on public.community_stories for select
using (status = 'approved' or user_id = auth.uid() or public.is_admin());

create policy "Authenticated users submit stories"
on public.community_stories for insert
with check (auth.uid() = user_id);

create policy "Admins manage stories"
on public.community_stories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can submit contact messages"
on public.contact_messages for insert
with check (true);

create policy "Admins read contact messages"
on public.contact_messages for select
using (public.is_admin());
