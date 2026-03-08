-- Create agencies table for PA agency contacts
create table if not exists public.agencies (
  id serial primary key,
  oor_id integer unique,
  name text not null,
  county text,
  officer_name text,
  phone text,
  email_primary text,
  email_secondary text,
  website text,
  address text,
  agency_type text,
  subtype text,
  municipality text,
  school_district text,
  oor_link text,
  last_scraped_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.agencies enable row level security;

-- Public read access for agencies (everyone can search)
create policy "agencies_public_read" on public.agencies 
  for select using (true);

-- Create indexes for common search patterns
create index if not exists idx_agencies_county on public.agencies(county);
create index if not exists idx_agencies_subtype on public.agencies(subtype);
create index if not exists idx_agencies_name on public.agencies using gin(to_tsvector('english', name));
create index if not exists idx_agencies_oor_id on public.agencies(oor_id);
