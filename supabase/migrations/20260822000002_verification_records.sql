-- Enrolment-window table the two live call sites already query.
-- sign-contract: SELECT id WHERE session_id
-- complycube-verification-callback: UPDATE … WHERE session_id
-- Keyed on session_id. No complycube_client_id column.

CREATE TABLE IF NOT EXISTS public.verification_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  complycube_verification_id text,
  verification_status text,
  biometric_confirmed boolean NOT NULL DEFAULT false,
  selfie_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_records_session_id_idx
  ON public.verification_records (session_id);

ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_verification_records" ON public.verification_records;
CREATE POLICY "service_role_all_verification_records"
  ON public.verification_records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
