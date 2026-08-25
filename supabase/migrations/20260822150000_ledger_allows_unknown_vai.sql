-- §16.3 — enroll_required still writes a ledger row. The attempted V.A.I. may not exist.
ALTER TABLE public.verification_ledger
  DROP CONSTRAINT IF EXISTS verification_ledger_vai_fkey;
