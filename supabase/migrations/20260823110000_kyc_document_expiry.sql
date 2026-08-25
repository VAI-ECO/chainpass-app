-- §10.1 — document expiry captured at KYC, held on the session, written at mint.
-- Live enrol-reveal omitted it; renewal's two-date test cannot run without it.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS document_expiry date;

COMMENT ON COLUMN public.sessions.document_expiry IS
  'KYC extractedData.documentDetails.expirationDate. Written to credentials at reveal.';

COMMENT ON COLUMN public.credentials.document_expiry IS
  'Canon §10.1 / §16.2 document_expires_at. Live name is document_expiry. From the KYC document.';
