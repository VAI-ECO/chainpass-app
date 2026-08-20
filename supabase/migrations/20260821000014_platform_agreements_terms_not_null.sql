-- §14.3 / §16.6 step 6 item 7 — terms required on platform_agreements.
-- No terms → no agreement → no API key path.

UPDATE public.platform_agreements
SET
  terms_doc_ref = COALESCE(terms_doc_ref, 'minimum standard terms'),
  terms_version = COALESCE(terms_version, '1')
WHERE terms_doc_ref IS NULL OR terms_version IS NULL;

ALTER TABLE public.platform_agreements
  ALTER COLUMN terms_doc_ref SET NOT NULL;

ALTER TABLE public.platform_agreements
  ALTER COLUMN terms_version SET NOT NULL;
