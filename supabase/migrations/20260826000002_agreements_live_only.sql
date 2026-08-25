-- SPEC-CP-02: draft is never served; retired is refused at open.
-- Enforcement is the database, not registry.ts.

CREATE OR REPLACE FUNCTION public.agreements_open_live_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status
  FROM public.contracts
  WHERE contract_id = NEW.contract_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'contract_not_found';
  END IF;
  IF v_status = 'draft' THEN
    RAISE EXCEPTION 'draft_never_served';
  END IF;
  IF v_status = 'retired' THEN
    RAISE EXCEPTION 'retired_refused_at_open';
  END IF;
  IF v_status IS DISTINCT FROM 'live' THEN
    RAISE EXCEPTION 'contract_not_live';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agreements_open_live_only ON public.agreements;
CREATE TRIGGER trg_agreements_open_live_only
  BEFORE INSERT ON public.agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.agreements_open_live_only();
