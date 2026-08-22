-- Create unified vais view that consolidates data from vai_assignments, verification_records, and payments
-- This provides a single interface for VAI lookups with payment and status information

CREATE OR REPLACE VIEW public.vais AS
SELECT 
  va.vai_code AS vai_number,
  va.status,
  va.created_at AS original_vai_created_at,
  va.id AS vai_assignment_id,
  va.verification_record_id,
  vr.verification_status,
  vr.biometric_confirmed,
  vr.selfie_url,
  -- Payment information
  p.id AS payment_id,
  p.status AS payment_status,
  CASE 
    WHEN p.status IN ('completed', 'succeeded', 'paid') THEN p.created_at
    ELSE NULL
  END AS payment_completed_at,
  p.amount AS payment_amount,
  p.stripe_payment_intent_id,
  -- Calculate expiration (1 year from creation)
  (va.created_at + INTERVAL '1 year') AS expires_at,
  -- Legal agreements
  la.leo_declaration_signed,
  la.signature_agreement_signed
FROM public.vai_assignments va
LEFT JOIN public.verification_records vr ON va.verification_record_id = vr.id
LEFT JOIN public.payments p ON vr.id = p.verification_record_id
LEFT JOIN public.legal_agreements la ON va.id = la.vai_assignment_id;

-- Create index on vai_assignments for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_vai_assignments_status ON public.vai_assignments(status);
CREATE INDEX IF NOT EXISTS idx_vai_assignments_created_at ON public.vai_assignments(created_at);

-- Create index on payments for status lookups
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Add comment
COMMENT ON VIEW public.vais IS 'Unified view of VAI numbers with payment and verification status';

-- Enable RLS on the view (inherits from underlying tables)
-- Note: Views don't have RLS, but the underlying tables do









