create table if not exists public.medicare_saved_views (
  id uuid primary key,
  owner_id text not null default 'default',
  name text not null,
  module text not null,
  dataset_id text,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medicare_saved_views_owner_updated_idx
  on public.medicare_saved_views (owner_id, updated_at desc);

create table if not exists public.medicare_query_runs (
  id uuid primary key,
  owner_id text not null default 'default',
  method text not null,
  dataset_id text,
  request jsonb not null default '{}'::jsonb,
  response jsonb,
  row_count integer,
  status_code integer,
  ok boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists medicare_query_runs_owner_created_idx
  on public.medicare_query_runs (owner_id, created_at desc);

create index if not exists medicare_query_runs_method_created_idx
  on public.medicare_query_runs (method, created_at desc);

alter table public.medicare_saved_views enable row level security;
alter table public.medicare_query_runs enable row level security;

drop policy if exists medicare_saved_views_service_role_all on public.medicare_saved_views;
create policy medicare_saved_views_service_role_all
  on public.medicare_saved_views
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists medicare_query_runs_service_role_all on public.medicare_query_runs;
create policy medicare_query_runs_service_role_all
  on public.medicare_query_runs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
