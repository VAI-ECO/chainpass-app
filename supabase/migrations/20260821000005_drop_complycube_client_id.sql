-- Stage (d): drop the column. Patent gate: ChainPass no longer holds a provider lookup key.
ALTER TABLE public.credentials
  DROP COLUMN IF EXISTS complycube_client_id;
