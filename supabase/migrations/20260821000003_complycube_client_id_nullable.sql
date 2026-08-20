-- Stage (a): ensure credentials.complycube_client_id is nullable.
-- Already dropped NOT NULL in 20260812000001; this is idempotent confirmation.
ALTER TABLE public.credentials
  ALTER COLUMN complycube_client_id DROP NOT NULL;
