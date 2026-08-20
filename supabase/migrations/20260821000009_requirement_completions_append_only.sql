-- §16.6 step 1 / item 5 — completion PK must allow append-only renewals.
-- Was PRIMARY KEY (vai, requirement_key, platform_id) — blocked a second row for the same triple.
-- OPERATIONS §11 item 8 / §16.2 known blocker.

ALTER TABLE public.requirement_completions
  DROP CONSTRAINT IF EXISTS requirement_completions_pkey;

ALTER TABLE public.requirement_completions
  ADD COLUMN IF NOT EXISTS id bigserial;

-- Ensure id is filled for any pre-existing rows, then promote to PK.
UPDATE public.requirement_completions
SET id = nextval(pg_get_serial_sequence('public.requirement_completions', 'id'))
WHERE id IS NULL;

ALTER TABLE public.requirement_completions
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.requirement_completions
  ADD PRIMARY KEY (id);

CREATE INDEX IF NOT EXISTS requirement_completions_vai_req_platform_signed_idx
  ON public.requirement_completions (vai, requirement_key, platform_id, signed_at DESC);
