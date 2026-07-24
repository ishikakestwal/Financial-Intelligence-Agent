-- FinGuard schema. Run once in the Supabase SQL editor if RPC auto-creation is unavailable.

-- Helper that lets the backend execute DDL through the Supabase RPC endpoint.
create or replace function exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;

create table if not exists users (
    user_id uuid primary key default gen_random_uuid(),
    email text unique not null,
    created_at timestamptz not null default now()
);

create table if not exists transactions (
    transaction_id uuid primary key default gen_random_uuid(),
    sender_hash text not null,
    receiver_hash text not null,
    amount numeric not null,
    timestamp timestamptz,
    bank_name text,
    risk_score numeric default 0,
    risk_level text default 'LOW',
    created_at timestamptz not null default now()
);

create table if not exists investigations (
    investigation_id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    risk_score numeric default 0,
    summary text
);

create table if not exists reports (
    report_id uuid primary key default gen_random_uuid(),
    investigation_id uuid references investigations(investigation_id) on delete cascade,
    created_at timestamptz not null default now(),
    content jsonb
);
