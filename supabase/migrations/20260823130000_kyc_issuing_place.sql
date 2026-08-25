-- Issuing country from the verified ID. Province when the document carries it
-- (a licence usually does; a passport does not). Not a legal name — §2.9 does
-- not forbid it. Null when absent.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS issuing_country text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS issuing_province text;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS issuing_country text;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS issuing_province text;

COMMENT ON COLUMN public.credentials.issuing_country IS
  'ISO country on the KYC document. Not a legal name. Written at mint.';
COMMENT ON COLUMN public.credentials.issuing_province IS
  'State/province on the KYC document when present. Null for a passport.';
COMMENT ON COLUMN public.sessions.issuing_country IS
  'Held from the KYC check until reveal writes credentials.issuing_country.';
COMMENT ON COLUMN public.sessions.issuing_province IS
  'Held from the KYC check until reveal. Null when the document has none.';
