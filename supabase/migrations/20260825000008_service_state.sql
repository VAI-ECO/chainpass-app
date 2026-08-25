-- RULINGS-CP-05 — service state control.
-- CONFLICT NOT RESOLVED: this prompt Run 4 item 5 says override PERSISTENT, NO EXPIRY.
-- RULINGS-CP-05 §2.3 item 3 says EXPIRY MANDATORY for declared-up.
-- Column override_expires_at exists. No CHECK forces it. No CHECK forbids it.

CREATE TABLE IF NOT EXISTS public.service_state (
  subsystem text PRIMARY KEY CHECK (subsystem IN ('matcher', 'image_serve')),
  mode text NOT NULL DEFAULT 'auto'
    CHECK (mode IN ('auto', 'declared_down', 'declared_up')),
  override_reason text,
  override_expires_at timestamptz,
  last_probe_at timestamptz,
  last_probe_ok boolean,
  consecutive_failures integer NOT NULL DEFAULT 0,
  consecutive_successes integer NOT NULL DEFAULT 0,
  served_as text NOT NULL DEFAULT 'down'
    CHECK (served_as IN ('up', 'down')),
  CONSTRAINT service_state_declared_reason CHECK (
    mode = 'auto' OR override_reason IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.service_state_log (
  id bigserial PRIMARY KEY,
  who text NOT NULL,
  at timestamptz NOT NULL DEFAULT clock_timestamp(),
  subsystem text NOT NULL CHECK (subsystem IN ('matcher', 'image_serve')),
  from_state text NOT NULL,
  to_state text NOT NULL,
  why text
);

INSERT INTO public.service_state (subsystem, mode, served_as)
VALUES ('matcher', 'auto', 'down'), ('image_serve', 'auto', 'down')
ON CONFLICT (subsystem) DO NOTHING;

CREATE OR REPLACE FUNCTION public.forbid_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only (constraint, not application code)', TG_TABLE_NAME;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_state_log_no_update ON public.service_state_log;
CREATE TRIGGER trg_service_state_log_no_update
  BEFORE UPDATE OR DELETE ON public.service_state_log
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

-- settings.value is NOT NULL. UNSET is this schema's stored form of a null figure.
INSERT INTO public.settings (key, value)
VALUES
  ('service_state_hysteresis_n', 'UNSET'),
  ('service_state_hysteresis_m', 'UNSET'),
  ('service_state_probe_interval_seconds', 'UNSET'),
  ('service_state_cache_ttl_seconds', 'UNSET')
ON CONFLICT (key) DO NOTHING;

REVOKE UPDATE, DELETE ON public.service_state_log
FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT ON public.service_state_log TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.service_state TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER TABLE public.service_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_state_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all_service_state ON public.service_state;
CREATE POLICY service_role_all_service_state ON public.service_state
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS service_role_all_service_state_log ON public.service_state_log;
CREATE POLICY service_role_all_service_state_log ON public.service_state_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
