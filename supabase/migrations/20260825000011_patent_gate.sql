-- CANON-CP-01 §12 item 6 — patent gate. Delete complycube_client_id at the handoff.
-- baselines.engine is derived from the model checksum, never MODEL_VERSION.

ALTER TABLE public.credentials
  DROP COLUMN IF EXISTS complycube_client_id;

ALTER TABLE public.baselines
  ADD COLUMN IF NOT EXISTS engine text;

ALTER TABLE public.baselines
  DROP CONSTRAINT IF EXISTS baselines_engine_not_model_version;

ALTER TABLE public.baselines
  ADD CONSTRAINT baselines_engine_not_model_version
  CHECK (engine IS NULL OR engine IS DISTINCT FROM model_version);

COMMENT ON COLUMN public.baselines.engine IS
  'Derived from the model checksum, never MODEL_VERSION.';
