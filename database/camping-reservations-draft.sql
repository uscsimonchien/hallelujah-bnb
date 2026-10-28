-- Camping reservation foundation (review before applying).
-- Separate from the existing four-room homestay bookings.
create extension if not exists btree_gist;
create table if not exists public.camping_sites (
 id text primary key,
 area text not null,
 width_m numeric(4,1) not null,
 depth_m numeric(4,1) not null,
 active boolean not null default true,
 nightly_price integer check (nightly_price >= 0),
 created_at timestamptz not null default now()
);
insert into public.camping_sites(id,area,width_m,depth_m) values
 ('3F-1','3F',3,5),('3F-2','3F',3,5),
 ('4F-A-1','4F-A',4,6),('4F-A-2','4F-A',4,6),
 ('4F-B-1','4F-B',4,6),('4F-B-2','4F-B',4,6),
 ('6F-B-1','6F-B',4,6),('6F-B-2','6F-B',4,6)
on conflict (id) do nothing;
create table if not exists public.camping_reservations (
 id bigint generated always as identity primary key,
 code text not null unique,
 guest_name text not null,
 guest_phone text not null,
 checkin date not null,
 checkout date not null,
 guests integer not null check(guests > 0),
 status text not null default 'pending' check(status in ('pending','confirmed','cancelled','expired')),
 hold_expires_at timestamptz,
 total integer not null check(total >= 0),
 deposit_due integer not null check(deposit_due >= 0),
 deposit_paid integer not null default 0 check(deposit_paid >= 0),
 balance_paid integer not null default 0 check(balance_paid >= 0),
 note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint camping_dates_valid check(checkout > checkin),
 constraint camping_paid_valid check(deposit_paid + balance_paid <= total)
);
create table if not exists public.camping_reservation_sites (
 reservation_id bigint not null references public.camping_reservations(id) on delete cascade,
 site_id text not null references public.camping_sites(id),
 checkin date not null,
 checkout date not null,
 status text not null check(status in ('pending','confirmed','cancelled','expired')),
 primary key(reservation_id,site_id),
 constraint camping_site_dates_valid check(checkout > checkin),
 constraint camping_no_confirmed_overlap exclude using gist (
   site_id with =, daterange(checkin,checkout,'[)') with &&
 ) where (status = 'confirmed')
);
create table if not exists public.camping_payments (
 id bigint generated always as identity primary key,
 reservation_id bigint not null references public.camping_reservations(id),
 kind text not null check(kind in ('deposit','balance','refund')),
 amount integer not null check(amount > 0),
 method text not null default 'bank_transfer',
 reference text,
 paid_at timestamptz,
 recorded_at timestamptz not null default now()
);
alter table public.camping_sites enable row level security;
alter table public.camping_reservations enable row level security;
alter table public.camping_reservation_sites enable row level security;
alter table public.camping_payments enable row level security;
-- No public write policies: use authenticated server endpoints with validated access.
-- Confirmed reservation rows must be synchronized with reservation_sites
-- within the same transaction; pending holds require transactional locking
-- and expiration logic in the API before accepting live bookings.
