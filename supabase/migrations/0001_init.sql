-- Aruba Home Services — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`) before importing seed data.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (mirrors auth.users; role = customer | provider | admin)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text not null default '',
  role        text not null default 'customer' check (role in ('customer','provider','admin')),
  phone       text,
  provider_id uuid,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data ->> 'role' = 'provider' then 'provider' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Service categories (data-driven — add rows, not code)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  slug          text primary key,
  icon          text not null default '🔧',
  price_min_awg numeric not null default 50,
  price_max_awg numeric not null default 500,
  sort_order    int not null default 100
);

-- ---------------------------------------------------------------------------
-- Providers (the island-wide directory)
-- ---------------------------------------------------------------------------
create table if not exists public.providers (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  categories        text[] not null default '{}',
  phone             text not null default '',
  address           text not null default 'Aruba',
  neighborhood      text not null default 'Island-wide',
  website           text not null default '',
  bio               text not null default '',
  verified          boolean not null default false,
  insured           boolean not null default false,
  status            text not null default 'pending' check (status in ('pending','approved','rejected')),
  rating_avg        numeric not null default 0,
  review_count      int not null default 0,
  jobs_completed    int not null default 0,
  hourly_rate_awg   numeric,
  years_in_business int,
  owner_user_id     uuid references public.profiles (id) on delete set null,
  license_file_name text,
  created_at        timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_provider_id_fkey;
alter table public.profiles
  add constraint profiles_provider_id_fkey
  foreign key (provider_id) references public.providers (id) on delete set null;

create index if not exists providers_status_idx on public.providers (status);
create index if not exists providers_categories_idx on public.providers using gin (categories);

-- ---------------------------------------------------------------------------
-- Bookings (no payment at booking; payment_status: pending → invoiced → paid)
-- ---------------------------------------------------------------------------
create sequence if not exists public.booking_ref_seq start 1000;

create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  ref             text not null unique default ('AHS-' || nextval('public.booking_ref_seq')),
  customer_id     uuid not null references public.profiles (id) on delete cascade,
  provider_id     uuid not null references public.providers (id) on delete cascade,
  category_slug   text not null references public.categories (slug),
  description     text not null default '',
  neighborhood    text not null default 'Island-wide',
  address         text not null default '',
  scheduled_at    timestamptz,
  asap            boolean not null default false,
  status          text not null default 'pending'
                  check (status in ('pending','accepted','declined','completed','cancelled')),
  payment_status  text not null default 'pending'
                  check (payment_status in ('pending','invoiced','paid')),
  final_price_awg numeric,
  created_at      timestamptz not null default now()
);

create index if not exists bookings_customer_idx on public.bookings (customer_id);
create index if not exists bookings_provider_idx on public.bookings (provider_id);

-- ---------------------------------------------------------------------------
-- Invoices (generated when a job is completed; paid by Aruba Bank transfer)
-- ---------------------------------------------------------------------------
create sequence if not exists public.invoice_number_seq start 1;

create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  number            text not null unique
                    default ('INV-' || to_char(now(), 'YYYY') || '-' ||
                             lpad(nextval('public.invoice_number_seq')::text, 4, '0')),
  booking_id        uuid not null references public.bookings (id) on delete cascade,
  provider_id       uuid not null references public.providers (id) on delete cascade,
  customer_id       uuid not null references public.profiles (id) on delete cascade,
  amount_awg        numeric not null check (amount_awg > 0),
  payment_reference text not null,
  status            text not null default 'invoiced' check (status in ('invoiced','paid')),
  issued_at         timestamptz not null default now(),
  paid_at           timestamptz
);

create index if not exists invoices_customer_idx on public.invoices (customer_id);
create index if not exists invoices_provider_idx on public.invoices (provider_id);

-- ---------------------------------------------------------------------------
-- Reviews & favorites
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references public.bookings (id) on delete set null,
  provider_id   uuid not null references public.providers (id) on delete cascade,
  customer_id   uuid not null references public.profiles (id) on delete cascade,
  customer_name text not null default 'Customer',
  rating        int not null check (rating between 1 and 5),
  comment       text not null default '',
  created_at    timestamptz not null default now(),
  unique (booking_id)
);

create table if not exists public.favorites (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete cascade,
  primary key (user_id, provider_id)
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.increment_jobs_completed(p_provider_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.providers
  set jobs_completed = jobs_completed + 1
  where id = p_provider_id;
$$;

-- ---------------------------------------------------------------------------
-- Storage bucket for provider license/insurance uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('provider-docs', 'provider-docs', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row-level security
-- The app's server actions use the service-role key (bypasses RLS) with
-- role checks in application code; these policies protect any direct
-- client-side access with the anon key.
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.bookings  enable row level security;
alter table public.invoices  enable row level security;
alter table public.reviews   enable row level security;
alter table public.favorites enable row level security;

create policy "categories are public" on public.categories
  for select using (true);

create policy "approved providers are public" on public.providers
  for select using (status = 'approved' or owner_user_id = auth.uid());

create policy "reviews are public" on public.reviews
  for select using (true);

create policy "own profile read" on public.profiles
  for select using (id = auth.uid());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid());

create policy "own bookings read" on public.bookings
  for select using (
    customer_id = auth.uid()
    or provider_id in (select provider_id from public.profiles where id = auth.uid())
  );
create policy "customers create bookings" on public.bookings
  for insert with check (customer_id = auth.uid());

create policy "own invoices read" on public.invoices
  for select using (
    customer_id = auth.uid()
    or provider_id in (select provider_id from public.profiles where id = auth.uid())
  );

create policy "customers write reviews" on public.reviews
  for insert with check (customer_id = auth.uid());

create policy "own favorites" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
