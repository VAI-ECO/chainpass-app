-- §16.6 step 1 / item 3 — originating_platform_id immutable via DATABASE TRIGGER.
-- §2.8 item 1, §15 item 5. Never application code.

CREATE OR REPLACE FUNCTION public.forbid_originating_platform_id_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.originating_platform_id IS DISTINCT FROM OLD.originating_platform_id THEN
    RAISE EXCEPTION
      'originating_platform_id is immutable (CANON-CP-01 §2.8 item 1 / §15 item 5)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_credentials_originating_platform_immutable ON public.credentials;

CREATE TRIGGER trg_credentials_originating_platform_immutable
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.forbid_originating_platform_id_update();
