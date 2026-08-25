-- CANON-CP-02 §1 step 9. Contact spec on the platform row.
-- Empty object = ChainPass floor (one of email or phone, plus T&C).

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS collection_fields jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS contact_spec jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.platforms.collection_fields IS
  'Step 9 contact spec alias. required: username, email, phone in any combination. Empty = ChainPass floor only.';
COMMENT ON COLUMN public.platforms.contact_spec IS
  'Step 9 collection. Empty = floor: one of phone or email plus T&C. CANON-CP-02 §1.';
