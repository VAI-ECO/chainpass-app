-- Create LEO retrieval audit table
CREATE TABLE IF NOT EXISTS public.leo_retrieval_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL,
  leo_badge_number TEXT NOT NULL,
  leo_jurisdiction TEXT NOT NULL,
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add index for auditing
CREATE INDEX IF NOT EXISTS idx_leo_retrieval_transaction ON public.leo_retrieval_audit(transaction_number);
CREATE INDEX IF NOT EXISTS idx_leo_retrieval_badge ON public.leo_retrieval_audit(leo_badge_number);
CREATE INDEX IF NOT EXISTS idx_leo_retrieval_created_at ON public.leo_retrieval_audit(created_at);

-- Enable RLS
ALTER TABLE public.leo_retrieval_audit ENABLE ROW LEVEL SECURITY;

-- Service role access only (no public access)
DROP POLICY IF EXISTS "Service role can manage leo_retrieval_audit" ON public.leo_retrieval_audit;
CREATE POLICY "Service role can manage leo_retrieval_audit"
ON public.leo_retrieval_audit
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.leo_retrieval_audit IS 'Audit log for all law enforcement emergency retrieval requests';



