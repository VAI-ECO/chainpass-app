-- CANON-CP-04 §3 / §5 — trial mark set at insert, never removable.
-- The switch is per platform. Admin-flipped. Never a deploy.

ALTER TABLE public.baselines
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.baselines.is_trial IS
  'Set at insert, never removable. CANON-CP-04 §3.';

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS trial_mode boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.platforms.trial_mode IS
  'Admin-flipped trial switch. Never a deploy. CANON-CP-04 §5.';

CREATE OR REPLACE FUNCTION public.forbid_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only (constraint, not application code)', TG_TABLE_NAME;
END;
$$;

CREATE OR REPLACE FUNCTION public.baselines_is_trial_frozen()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_trial IS DISTINCT FROM OLD.is_trial THEN
    RAISE EXCEPTION 'baselines.is_trial is set at insert, never removable (CANON-CP-04 §3)';
  END IF;
  RAISE EXCEPTION 'baselines is append-only (constraint, not application code)';
END;
$$;

DROP TRIGGER IF EXISTS trg_baselines_append_only ON public.baselines;
CREATE TRIGGER trg_baselines_append_only
  BEFORE UPDATE OR DELETE ON public.baselines
  FOR EACH ROW EXECUTE FUNCTION public.baselines_is_trial_frozen();

REVOKE UPDATE, DELETE ON public.baselines
FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT ON public.baselines TO service_role;
