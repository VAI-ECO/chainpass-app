-- verified_at: updated on in-house renewal (§16.4). Live credentials lacked this column.
ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

COMMENT ON COLUMN public.credentials.verified_at IS
  'Last successful in-house face verification. Updated on renewal when both document_expiry and next_complycube_date (provider retention) are still live.';
