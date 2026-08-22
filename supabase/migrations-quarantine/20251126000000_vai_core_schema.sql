-- VAI Core Schema rebuild (ChainPass Build Prompt Part 2)
-- Creates canonical VAI lifecycle tables plus supporting entities

begin;

-- Drop legacy view if it conflicts with new table (optional safeguard)
drop view if exists public.vai_records cascade;

-- -------------------------------------------------------------------
-- VAI RECORDS
-- -------------------------------------------------------------------
create table if not exists public.vai_records (
  vai_number varchar(20) primary key,
  status varchar(20) not null default 'trial', -- trial | active | locked | suspended | banned
  biometric_hash text not null unique,
  complycube_check_id varchar(100) not null,
  verified_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  payment_due_at timestamptz,
  paid_at timestamptz,
  locked_at timestamptz,
  renewal_count integer not null default 0,
  last_renewal_at timestamptz,
  last_complycube_check_at timestamptz,
  phone varchar(20) not null,
  email varchar(255),
  referral_vai varchar(20) references public.vai_records(vai_number),
  platform_source varchar(50) not null default 'chainpass',
  platforms_registered jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_vai_records_status on public.vai_records(status);
create index if not exists idx_vai_records_expires on public.vai_records(expires_at);
create index if not exists idx_vai_records_payment_due on public.vai_records(payment_due_at) where status = 'trial';
create index if not exists idx_vai_records_phone on public.vai_records(phone);
create index if not exists idx_vai_records_referral on public.vai_records(referral_vai);

create or replace function public.set_vai_records_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vai_records_updated_at on public.vai_records;
create trigger trg_vai_records_updated_at
  before update on public.vai_records
  for each row execute procedure public.set_vai_records_updated_at();

-- -------------------------------------------------------------------
-- VERIFICATION SESSIONS
-- -------------------------------------------------------------------
create table if not exists public.verification_sessions (
  id uuid primary key default gen_random_uuid(),
  status varchar(30) not null default 'started',
  phone varchar(20),
  email varchar(255),
  stripe_payment_intent_id varchar(100),
  amount_cents integer,
  paid_at timestamptz,
  complycube_sdk_token text,
  complycube_check_id varchar(100),
  vai_number varchar(20) references public.vai_records(vai_number),
  biometric_hash text,
  referral_vai varchar(20),
  platform_source varchar(50) default 'chainpass',
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  expires_at timestamptz default (timezone('utc', now()) + interval '24 hours')
);

create index if not exists idx_verification_sessions_status on public.verification_sessions(status);
create index if not exists idx_verification_sessions_vai on public.verification_sessions(vai_number);

create or replace function public.set_verification_sessions_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_verification_sessions_updated_at on public.verification_sessions;
create trigger trg_verification_sessions_updated_at
  before update on public.verification_sessions
  for each row execute procedure public.set_verification_sessions_updated_at();

-- -------------------------------------------------------------------
-- BUSINESS RECORDS + COUPONS + COMPOSITE VAIs
-- -------------------------------------------------------------------
create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  business_vai varchar(20) unique not null,
  owner_vai varchar(20) not null references public.vai_records(vai_number),
  business_type varchar(20) not null, -- service | non_service
  business_name varchar(200) not null,
  business_category varchar(50),
  package_type varchar(20) not null,
  package_price_cents integer not null,
  coupons_total integer not null default 0,
  coupons_issued integer not null default 0,
  coupons_redeemed integer not null default 0,
  status varchar(20) not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  owner_verified_at timestamptz not null
);

create table if not exists public.employee_coupons (
  id uuid primary key default gen_random_uuid(),
  coupon_code varchar(32) unique not null,
  business_id uuid not null references public.business_records(id) on delete cascade,
  business_vai varchar(20) not null,
  status varchar(20) not null default 'available',
  issued_to_email varchar(255),
  issued_to_phone varchar(20),
  issued_at timestamptz,
  issued_by_vai varchar(20),
  redeemed_by_vai varchar(20) references public.vai_records(vai_number),
  composite_vai varchar(20),
  redeemed_at timestamptz,
  retracted_at timestamptz,
  retracted_by_vai varchar(20),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_employee_coupons_business on public.employee_coupons(business_id);
create index if not exists idx_employee_coupons_status on public.employee_coupons(status);

create table if not exists public.composite_vai_records (
  id uuid primary key default gen_random_uuid(),
  composite_vai varchar(20) unique not null,
  personal_vai varchar(20) not null references public.vai_records(vai_number),
  business_vai varchar(20) not null,
  business_id uuid not null references public.business_records(id) on delete cascade,
  coupon_id uuid references public.employee_coupons(id) on delete set null,
  status varchar(20) not null default 'active',
  hired_at timestamptz not null default timezone('utc', now()),
  terminated_at timestamptz,
  rehired_at timestamptz,
  review_count integer not null default 0,
  average_rating numeric(3,1)
);

create index if not exists idx_composite_vai_personal on public.composite_vai_records(personal_vai);
create index if not exists idx_composite_vai_business on public.composite_vai_records(business_id);

-- -------------------------------------------------------------------
-- RECOVERY REQUESTS
-- -------------------------------------------------------------------
create table if not exists public.recovery_requests (
  id uuid primary key default gen_random_uuid(),
  vai_number varchar(20) not null references public.vai_records(vai_number),
  recovery_method varchar(10) not null, -- phone | email
  recovery_destination varchar(255) not null,
  otp_code varchar(6) not null,
  otp_expires_at timestamptz not null,
  otp_attempts integer not null default 0,
  otp_verified_at timestamptz,
  facial_verified boolean not null default false,
  facial_confidence numeric(5,2),
  facial_verified_at timestamptz,
  status varchar(20) not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '1 hour')
);

create index if not exists idx_recovery_requests_vai on public.recovery_requests(vai_number);
create index if not exists idx_recovery_requests_status on public.recovery_requests(status);

-- -------------------------------------------------------------------
-- VAI AUDIT LOG
-- -------------------------------------------------------------------
create table if not exists public.vai_audit_log (
  id uuid primary key default gen_random_uuid(),
  vai_number varchar(20) not null,
  action varchar(50) not null,
  details jsonb not null default '{}'::jsonb,
  performed_by varchar(50),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_vai_audit_number on public.vai_audit_log(vai_number);
create index if not exists idx_vai_audit_action on public.vai_audit_log(action);
create index if not exists idx_vai_audit_created on public.vai_audit_log(created_at desc);

-- -------------------------------------------------------------------
-- REFERRAL EVENTS
-- -------------------------------------------------------------------
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_vai varchar(20) not null references public.vai_records(vai_number),
  referred_vai varchar(20) not null references public.vai_records(vai_number),
  event_type varchar(50) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_referral_events_referrer on public.referral_events(referrer_vai);
create index if not exists idx_referral_events_referred on public.referral_events(referred_vai);

-- -------------------------------------------------------------------
-- BASIC POLICIES (Service role full access; others read-only for now)
-- -------------------------------------------------------------------
alter table public.vai_records enable row level security;
alter table public.verification_sessions enable row level security;
alter table public.business_records enable row level security;
alter table public.employee_coupons enable row level security;
alter table public.composite_vai_records enable row level security;
alter table public.recovery_requests enable row level security;
alter table public.vai_audit_log enable row level security;
alter table public.referral_events enable row level security;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.vai_records for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.verification_sessions for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.business_records for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.employee_coupons for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.composite_vai_records for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.recovery_requests for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.vai_audit_log for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

do $$
begin
  execute 'create policy \"service_role_full_access\" on public.referral_events for all to service_role using (true) with check (true)';
exception when duplicate_object then null;
end$$;

commit;

