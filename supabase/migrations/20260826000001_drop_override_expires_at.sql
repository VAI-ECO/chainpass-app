-- Owner ruled override expiry out. RULINGS-CP-05 §2.3: persistent until the probe agrees.

ALTER TABLE public.service_state
  DROP COLUMN IF EXISTS override_expires_at;
