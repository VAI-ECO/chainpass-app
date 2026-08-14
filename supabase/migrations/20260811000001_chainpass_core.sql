create extension if not exists "vector";

create table platforms (
  id              text primary key,
  display_name    text not null,
  webhook_url     text,
  webhook_secret  text,
  webhook_state   text not null default 'active'
                  check (webhook_state in ('active','failing','disabled')),
  api_key_hash    text,
  created_at      timestamptz not null default now()
);

create table requirements (
  key             text primary key,
  display_name    text not null,
  kind            text not null
                  check (kind in ('declaration','agreement','release','check')),
  ecosystem_wide  boolean not null default false
);

create table requirement_versions (
  requirement_key text not null references requirements(key),
  version         text not null,
  body            text not null,
  effective_from  date not null,
  primary key (requirement_key, version)
);

create table platform_requirements (
  platform_id     text not null references platforms(id),
  requirement_key text not null references requirements(key),
  effective_from  date not null,
  sort_order      int  not null default 0,
  primary key (platform_id, requirement_key)
);

create table credentials (
  vai                   char(7) primary key,
  state                 text not null default 'active'
                        check (state in ('active','expiring','expired',
                               'awaiting','locked','suspended','banned')),
  complycube_client_id  text not null,
  document_expiry       date not null,
  next_renewal_date     date not null,
  next_complycube_date  date not null,
  screening_state       text not null default 'pending'
                        check (screening_state in ('pending','clear','flagged')),
  screening_note        text,
  issued_at             timestamptz not null default now(),
  state_changed_at      timestamptz not null default now()
);

create table baselines (
  id                bigserial primary key,
  vai               char(7) not null references credentials(vai),
  vector            vector(512) not null,
  model             text not null,
  model_version     text not null,
  enrollment_score  real not null,
  variance_score    real,
  photo_ref         text,
  source            text not null default 'complycube'
                    check (source in ('complycube')),
  created_at        timestamptz not null default now()
);

create index on baselines (vai, created_at desc);

create table credential_platforms (
  vai            char(7) not null references credentials(vai),
  platform_id    text    not null references platforms(id),
  first_seen_at  timestamptz not null default now(),
  state          text not null default 'active'
                 check (state in ('active','rejected')),
  state_note     text,
  state_at       timestamptz,
  primary key (vai, platform_id)
);

create table requirement_completions (
  vai             char(7) not null references credentials(vai),
  requirement_key text not null references requirements(key),
  platform_id     text references platforms(id),
  signed_version  text not null,
  signed_at       timestamptz not null default now(),
  primary key (vai, requirement_key, platform_id)
);

create table sessions (
  id                    text primary key,
  platform_id           text not null references platforms(id),
  vai                   char(7) references credentials(vai),
  route                 text not null
                        check (route in ('enrollment','rebaseline','unlock','renewal')),
  state                 text not null default 'open'
                        check (state in ('open','at_provider','processing',
                               'queued','complete','failed','expired')),
  complycube_session_id text,
  platform_session_ref  text,
  platform_return_url   text,
  frame                 text check (frame in ('A','B')),
  return_url            text not null,
  expires_at            timestamptz not null,
  created_at            timestamptz not null default now()
);

create table payments (
  id                   bigserial primary key,
  session_id           text not null references sessions(id),
  vai                  char(7) references credentials(vai),
  processor            text not null,
  processor_reference  text not null,
  amount_cents         int  not null,
  currency             char(3) not null,
  period_start         date not null,
  period_end           date not null,
  state                text not null
                       check (state in ('pending','paid','failed','refunded')),
  created_at           timestamptz not null default now()
);

create index on payments (vai, period_end desc);

create table credential_events (
  id            bigserial primary key,
  event_id      text not null unique,
  emission_id   text not null,
  platform_id   text not null references platforms(id),
  vai           char(7) not null references credentials(vai),
  type          text not null,
  payload       jsonb not null,
  attempts      int not null default 0,
  delivered_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index on credential_events (platform_id, delivered_at nulls first, created_at);
create index on credential_events (emission_id);

create table lookup_log (
  id           bigserial primary key,
  platform_id  text not null references platforms(id),
  vai          char(7) not null,
  found        boolean not null,
  at           timestamptz not null default now()
);

create or replace function set_credential_dates(
  p_issued          date,
  p_document_expiry date
) returns table (next_renewal date, next_complycube date)
language sql immutable as $$
  select
    p_issued + interval '1 year',
    least(p_document_expiry, p_issued + interval '3 years');
$$;
