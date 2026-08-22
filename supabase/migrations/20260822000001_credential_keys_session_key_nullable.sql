-- Patent claim (§2.4 / §2.4a): ChainPass deletes its copy of the session key
-- at handoff. The row and timestamps stay. The value must be nullable.
ALTER TABLE public.credential_keys
  ALTER COLUMN session_key DROP NOT NULL;
