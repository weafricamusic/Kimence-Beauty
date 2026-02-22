-- FlowBeauty schema (run in Supabase SQL editor)
-- Requires: pgcrypto extension for gen_random_uuid()

create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Community
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Booking
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null default 60,
  price_cents int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed: default services (only if empty)
insert into public.services (name, duration_minutes, price_cents, active)
select v.name, v.duration_minutes, v.price_cents, v.active
from (
  values
    ('Consultation', 30, 0, true),
    ('Hair styling', 60, 250000, true)
) as v(name, duration_minutes, price_cents, active)
where not exists (select 1 from public.services);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  starts_at timestamptz not null,
  note text,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

-- Store
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

create table if not exists public.order_request_items (
  order_request_id uuid not null references public.order_requests (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null default 1,
  primary key (order_request_id, product_id)
);

-- Routine tracker
create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  time_of_day text not null default 'any',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  routine_item_id uuid not null references public.routine_items (id) on delete cascade,
  log_date date not null,
  done boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, routine_item_id, log_date)
);

-- Helper: is_admin check
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.is_admin = true
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.order_requests enable row level security;
alter table public.order_request_items enable row level security;
alter table public.routine_items enable row level security;
alter table public.routine_logs enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Posts policies
drop policy if exists "posts_select" on public.posts;
create policy "posts_select"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert"
  on public.posts for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "posts_delete_own_or_admin" on public.posts;
create policy "posts_delete_own_or_admin"
  on public.posts for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Likes policies
drop policy if exists "likes_select" on public.post_likes;
create policy "likes_select"
  on public.post_likes for select
  to authenticated
  using (true);

drop policy if exists "likes_insert_own" on public.post_likes;
create policy "likes_insert_own"
  on public.post_likes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "likes_delete_own" on public.post_likes;
create policy "likes_delete_own"
  on public.post_likes for delete
  to authenticated
  using (user_id = auth.uid());

-- Comments policies
drop policy if exists "comments_select" on public.comments;
create policy "comments_select"
  on public.comments for select
  to authenticated
  using (true);

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert"
  on public.comments for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin"
  on public.comments for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Services policies
drop policy if exists "services_select" on public.services;
create policy "services_select"
  on public.services for select
  to authenticated
  using (true);

drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write"
  on public.services for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Bookings policies
drop policy if exists "bookings_select_own_or_admin" on public.bookings;
create policy "bookings_select_own_or_admin"
  on public.bookings for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update"
  on public.bookings for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Products policies
drop policy if exists "products_select" on public.products;
create policy "products_select"
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Cart policies
drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own"
  on public.cart_items for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "cart_write_own" on public.cart_items;
create policy "cart_write_own"
  on public.cart_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Order policies
drop policy if exists "orders_select_own_or_admin" on public.order_requests;
create policy "orders_select_own_or_admin"
  on public.order_requests for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "orders_insert_own" on public.order_requests;
create policy "orders_insert_own"
  on public.order_requests for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "orders_admin_update" on public.order_requests;
create policy "orders_admin_update"
  on public.order_requests for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "order_items_select_own_or_admin" on public.order_request_items;
create policy "order_items_select_own_or_admin"
  on public.order_request_items for select
  to authenticated
  using (
    exists (
      select 1 from public.order_requests o
      where o.id = order_request_id and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "order_items_insert_own" on public.order_request_items;
create policy "order_items_insert_own"
  on public.order_request_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.order_requests o
      where o.id = order_request_id and o.user_id = auth.uid()
    )
  );

-- Routine policies
drop policy if exists "routine_items_own" on public.routine_items;
create policy "routine_items_own"
  on public.routine_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "routine_logs_own" on public.routine_logs;
create policy "routine_logs_own"
  on public.routine_logs for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
