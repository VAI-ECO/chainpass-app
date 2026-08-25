-- §4 background check. Cost is a setting. Supplier is a bank row.
-- Session holds only that a check ran — never the binary.

INSERT INTO public.settings (key, value) VALUES
  ('background_check_cost', '0.15')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.service_registry (service_id, name, adapter, status)
VALUES ('offenders_io', 'Offenders.io', 'offenders_io', 'active')
ON CONFLICT (service_id) DO NOTHING;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS background_check_at timestamptz;

COMMENT ON COLUMN public.sessions.background_check_at IS
  '§4 — a check ran. No result, no score, no detail. Completion row is written at reveal.';
