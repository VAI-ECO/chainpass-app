create table facial_verification_attempts (
  id           bigserial primary key,
  vai          char(7) not null references credentials(vai),
  platform_id  text not null references platforms(id),
  success      boolean not null,
  attempted_at timestamptz not null default now()
);

create index on facial_verification_attempts (vai, platform_id, attempted_at desc);
