-- SPEC-CP-02 §7 — the legal-name join log, built before the join.
-- Append-only by constraint and revoked privilege.

CREATE TABLE IF NOT EXISTS public.identity_join_log (
  id bigserial PRIMARY KEY,
  who text NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  authority text NOT NULL,
  vai char(7) NOT NULL
);

CREATE OR REPLACE FUNCTION public.forbid_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only (constraint, not application code)', TG_TABLE_NAME;
END;
$$;

DROP TRIGGER IF EXISTS trg_identity_join_log_no_update ON public.identity_join_log;
CREATE TRIGGER trg_identity_join_log_no_update
  BEFORE UPDATE OR DELETE ON public.identity_join_log
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

REVOKE UPDATE, DELETE ON public.identity_join_log
FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT ON public.identity_join_log TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER TABLE public.identity_join_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all_identity_join_log ON public.identity_join_log;
CREATE POLICY service_role_all_identity_join_log ON public.identity_join_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
