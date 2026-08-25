-- Access / V.A.I.: at most three platform_requirements. Pro: uncapped.
-- Enforced on write, never at the gate (RULINGS-CP-03 / CANON-CP-01 §4C.3).

CREATE OR REPLACE FUNCTION public.enforce_access_vai_requirement_cap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  lvl integer;
  n integer;
BEGIN
  SELECT service_level INTO lvl FROM public.platforms WHERE id = NEW.platform_id;
  IF lvl IS NULL OR lvl >= 3 THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO n
  FROM public.platform_requirements
  WHERE platform_id = NEW.platform_id
    AND (TG_OP <> 'INSERT' OR requirement_key <> NEW.requirement_key);
  IF TG_OP = 'INSERT' THEN
    n := n + 1;
  END IF;
  IF n > 3 THEN
    RAISE EXCEPTION 'access_vai_requirement_cap';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS platform_requirements_access_vai_cap ON public.platform_requirements;
CREATE TRIGGER platform_requirements_access_vai_cap
  BEFORE INSERT OR UPDATE ON public.platform_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_access_vai_requirement_cap();
