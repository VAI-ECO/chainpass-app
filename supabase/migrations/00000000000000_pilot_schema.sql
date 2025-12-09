begin;

drop table if exists public.feature_flags cascade;
drop table if exists public.announcements cascade;
drop table if exists public.referrals cascade;
drop table if exists public.reviews cascade;
drop table if exists public.encounters cascade;
drop table if exists public.vai_check_sessions cascade;
drop table if exists public.dateguard_sessions cascade;
drop table if exists public.safety_codes cascade;
drop table if exists public.guardian_group_members cascade;
drop table if exists public.guardian_groups cascade;
drop table if exists public.guardians cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  vai_number varchar(20) unique not null,
  username text unique not null,
  bio text,
  avatar_url text,
  tier text not null default 'standard',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.guardian_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.guardian_group_members (
  group_id uuid not null references public.guardian_groups(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  role text not null default 'member',
  added_at timestamptz not null default timezone('utc', now()),
  primary key (group_id, guardian_id)
);

create table public.safety_codes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  deactivate_code text not null,
  decoy_code text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.dateguard_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  duration_minutes integer not null,
  status text not null default 'scheduled',
  started_at timestamptz,
  location text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.vai_check_sessions (
  id uuid primary key default gen_random_uuid(),
  session_code varchar(32) unique not null,
  provider_vai varchar(20) not null,
  client_vai varchar(20) not null,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.encounters (
  id uuid primary key default gen_random_uuid(),
  vai_check_session_id uuid not null references public.vai_check_sessions(id) on delete cascade,
  party_a_vai varchar(20) not null,
  party_b_vai varchar(20) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  reviewer_vai varchar(20) not null,
  reviewee_vai varchar(20) not null,
  communication_rating smallint check (communication_rating between 1 and 5),
  respect_rating smallint check (respect_rating between 1 and 5),
  safety_rating smallint check (safety_rating between 1 and 5),
  accuracy_rating smallint check (accuracy_rating between 1 and 5),
  overall_rating smallint check (overall_rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_vai varchar(20) not null,
  referred_email text not null,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_feature_flags_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_feature_flags_updated_at on public.feature_flags;
create trigger trg_feature_flags_updated_at
  before update on public.feature_flags
  for each row execute procedure public.set_feature_flags_updated_at();

-- Enable RLS and add service role policies
alter table public.profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.guardian_groups enable row level security;
alter table public.guardian_group_members enable row level security;
alter table public.safety_codes enable row level security;
alter table public.dateguard_sessions enable row level security;
alter table public.vai_check_sessions enable row level security;
alter table public.encounters enable row level security;
alter table public.reviews enable row level security;
alter table public.referrals enable row level security;
alter table public.announcements enable row level security;
alter table public.feature_flags enable row level security;


-- psql meta-command not allowed in migration; manually add policies per table

drop policy if exists "service_role_all" on public.profiles;
create policy "service_role_all" on public.profiles for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.guardians;
create policy "service_role_all" on public.guardians for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.guardian_groups;
create policy "service_role_all" on public.guardian_groups for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.guardian_group_members;
create policy "service_role_all" on public.guardian_group_members for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.safety_codes;
create policy "service_role_all" on public.safety_codes for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.dateguard_sessions;
create policy "service_role_all" on public.dateguard_sessions for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.vai_check_sessions;
create policy "service_role_all" on public.vai_check_sessions for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.encounters;
create policy "service_role_all" on public.encounters for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.reviews;
create policy "service_role_all" on public.reviews for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.referrals;
create policy "service_role_all" on public.referrals for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.announcements;
create policy "service_role_all" on public.announcements for all to service_role using (true) with check (true);

drop policy if exists "service_role_all" on public.feature_flags;
create policy "service_role_all" on public.feature_flags for all to service_role using (true) with check (true);

commit;
