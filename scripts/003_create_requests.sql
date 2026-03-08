-- Create RTK requests table
create table if not exists public.rtk_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agency_id integer references public.agencies(id) not null,
  request_text text not null,
  request_date date not null default current_date,
  delivery_method text default 'Email',
  response_method text default 'Electronic',
  fee_threshold numeric default 0,
  status text default 'draft',
  pdf_url text,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.rtk_requests enable row level security;

-- Users can only access their own requests
create policy "requests_select_own" on public.rtk_requests 
  for select using (auth.uid() = user_id);

create policy "requests_insert_own" on public.rtk_requests 
  for insert with check (auth.uid() = user_id);

create policy "requests_update_own" on public.rtk_requests 
  for update using (auth.uid() = user_id);

create policy "requests_delete_own" on public.rtk_requests 
  for delete using (auth.uid() = user_id);

-- Create request templates table for saved request text
create table if not exists public.request_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  request_text text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.request_templates enable row level security;

-- Users can only access their own templates
create policy "templates_select_own" on public.request_templates 
  for select using (auth.uid() = user_id);

create policy "templates_insert_own" on public.request_templates 
  for insert with check (auth.uid() = user_id);

create policy "templates_update_own" on public.request_templates 
  for update using (auth.uid() = user_id);

create policy "templates_delete_own" on public.request_templates 
  for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_requests_user_id on public.rtk_requests(user_id);
create index if not exists idx_requests_status on public.rtk_requests(status);
create index if not exists idx_templates_user_id on public.request_templates(user_id);
