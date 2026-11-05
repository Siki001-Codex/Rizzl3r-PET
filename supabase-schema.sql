-- ====================================================================
-- RIZZL3R PET RECOVERY - SUPABASE SCHEMA SETUP
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create table for Dispatches (Bookings)
create table if not exists public.dispatches (
  id text primary key,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  volume_range text not null,
  target_date date not null,
  notes text,
  grade text default 'grade-a',
  status text default 'Pending' check (status in ('Pending', 'Assigned', 'En Route', 'Completed', 'Cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create table for Deliveries (Weighbridge Scale Logs)
create table if not exists public.deliveries (
  id text primary key,
  batch_id text not null,
  supplier text not null,
  grade text not null,
  gross_kg numeric(10,2) not null,
  net_kg numeric(10,2) not null,
  payout_ngn numeric(12,2) not null,
  purity numeric(5,2) not null,
  bottle_size text not null,
  timestamp text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create table for Cumulative Totalizer
create table if not exists public.totalizer (
  id integer primary key default 1,
  gross_kg numeric(12,2) default 24650,
  tare_deducted_kg numeric(12,2) default 16856,
  net_pet_kg numeric(12,2) default 7794,
  total_bottles bigint default 194850,
  daily_target bigint default 250000,
  daily_payout_ngn numeric(14,2) default 2514800,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial totalizer singleton if not exists
insert into public.totalizer (id, gross_kg, tare_deducted_kg, net_pet_kg, total_bottles, daily_target, daily_payout_ngn)
values (1, 24650, 16856, 7794, 194850, 250000, 2514800)
on conflict (id) do nothing;

-- 4. Enable Row Level Security (RLS)
alter table public.dispatches enable row level security;
alter table public.deliveries enable row level security;
alter table public.totalizer enable row level security;

-- 5. Open Policies for Public / Demo Access
-- (Allows reading and creating bookings without needing user sign-up)
create policy "Allow public select on dispatches" on public.dispatches for select using (true);
create policy "Allow public insert on dispatches" on public.dispatches for insert with check (true);
create policy "Allow public update on dispatches" on public.dispatches for update using (true);

create policy "Allow public select on deliveries" on public.deliveries for select using (true);
create policy "Allow public insert on deliveries" on public.deliveries for insert with check (true);

create policy "Allow public select on totalizer" on public.totalizer for select using (true);
create policy "Allow public update on totalizer" on public.totalizer for update using (true);

