create table facial_signature_attempts (
  id           bigserial primary key,
  session_id   text not null references sessions(id),
  success      boolean not null,
  attempted_at timestamptz not null default now()
);

create index on facial_signature_attempts (session_id, attempted_at desc);
