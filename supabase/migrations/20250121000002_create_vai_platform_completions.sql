-- Create vai_platform_completions table to track platform-specific requirement completions
-- This tracks which requirements each VAI has completed for each platform

CREATE TABLE IF NOT EXISTS public.vai_platform_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vai_number TEXT NOT NULL,
  platform_name VARCHAR(50) NOT NULL,
  payment_verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  le_declaration_signed BOOLEAN DEFAULT FALSE,
  signature_agreement_signed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_qualified BOOLEAN DEFAULT FALSE, -- cached status for performance
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_vai_platform UNIQUE(vai_number, platform_name)
);

-- Create indexes for performance
CREATE INDEX idx_vai_platform_completions_vai ON public.vai_platform_completions(vai_number);
CREATE INDEX idx_vai_platform_completions_platform ON public.vai_platform_completions(platform_name);
CREATE INDEX idx_vai_platform_completions_qualified ON public.vai_platform_completions(is_qualified) WHERE is_qualified = TRUE;
CREATE INDEX idx_vai_platform_completions_last_checked ON public.vai_platform_completions(last_checked);

-- Enable RLS
ALTER TABLE public.vai_platform_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role has full access
DROP POLICY IF EXISTS "Service role can manage platform completions" ON public.vai_platform_completions;
CREATE POLICY "Service role can manage platform completions"
ON public.vai_platform_completions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated reads (for API access)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.vai_platform_completions;
CREATE POLICY "Allow authenticated read access"
ON public.vai_platform_completions
FOR SELECT
TO authenticated
USING (true);

-- Allow public reads for API access (needed for external platform validation)
DROP POLICY IF EXISTS "Allow public read access for API" ON public.vai_platform_completions;
CREATE POLICY "Allow public read access for API"
ON public.vai_platform_completions
FOR SELECT
USING (true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_vai_platform_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_checked = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER vai_platform_completions_updated_at
  BEFORE UPDATE ON public.vai_platform_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_vai_platform_completions_updated_at();

-- Add comments
COMMENT ON TABLE public.vai_platform_completions IS 'Tracks platform-specific requirement completions per VAI number';
COMMENT ON COLUMN public.vai_platform_completions.is_qualified IS 'Cached status indicating if all requirements are met for this platform';
COMMENT ON COLUMN public.vai_platform_completions.last_checked IS 'Timestamp of last qualification check';









