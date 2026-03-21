-- ============================================================
-- Wishlist MVP — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. WISHLISTS TABLE
-- ============================================================
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlists enable row level security;

create policy "Users can view own wishlists"
  on public.wishlists for select
  using (auth.uid() = owner_id);

create policy "Users can create own wishlists"
  on public.wishlists for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own wishlists"
  on public.wishlists for update
  using (auth.uid() = owner_id);

create policy "Users can delete own wishlists"
  on public.wishlists for delete
  using (auth.uid() = owner_id);


-- ============================================================
-- 3. ITEMS TABLE
-- ============================================================
create table public.items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  name text not null,
  url text,
  price numeric(10, 2),
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

-- Items inherit wishlist ownership for access control
create policy "Users can view items on own wishlists"
  on public.items for select
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = items.wishlist_id
      and wishlists.owner_id = auth.uid()
    )
  );

create policy "Users can create items on own wishlists"
  on public.items for insert
  with check (
    exists (
      select 1 from public.wishlists
      where wishlists.id = items.wishlist_id
      and wishlists.owner_id = auth.uid()
    )
  );

create policy "Users can update items on own wishlists"
  on public.items for update
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = items.wishlist_id
      and wishlists.owner_id = auth.uid()
    )
  );

create policy "Users can delete items on own wishlists"
  on public.items for delete
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = items.wishlist_id
      and wishlists.owner_id = auth.uid()
    )
  );


-- ============================================================
-- 4. INDEXES
-- ============================================================
create index idx_wishlists_owner on public.wishlists(owner_id);
create index idx_items_wishlist on public.items(wishlist_id);
create index idx_items_position on public.items(wishlist_id, position);


-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger wishlists_updated_at
  before update on public.wishlists
  for each row execute function public.update_updated_at();


-- ============================================================
-- FUTURE TABLES (stubbed — uncomment when ready)
-- ============================================================

-- Friendships, events, event_members, and claims tables
-- will be added in later sprints per the PRD.
-- See the PRD Section 7 (Data Model) for full schema.
