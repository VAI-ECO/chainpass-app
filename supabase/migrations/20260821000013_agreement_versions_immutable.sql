-- §14.2 / §16.6 step 6 item 1 — agreement VERSION is immutable.
-- A version is never edited and never overwritten.

CREATE OR REPLACE FUNCTION public.forbid_agreement_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'agreement_versions are immutable (CANON-CP-01 §14.2 item 3)';
END;
$$;

DROP TRIGGER IF EXISTS trg_agreement_versions_immutable ON public.agreement_versions;

CREATE TRIGGER trg_agreement_versions_immutable
  BEFORE UPDATE OR DELETE ON public.agreement_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.forbid_agreement_version_mutation();
