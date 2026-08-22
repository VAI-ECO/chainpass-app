-- Create platform_requirements table to define what each platform requires
-- This allows different platforms to have different requirement sets

CREATE TABLE IF NOT EXISTS public.platform_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(50) UNIQUE NOT NULL,
  requires_payment BOOLEAN DEFAULT TRUE,
  requires_identity BOOLEAN DEFAULT TRUE,
  requires_le_declaration BOOLEAN DEFAULT FALSE,
  requires_signature BOOLEAN DEFAULT FALSE,
  custom_requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_platform_requirements_name ON public.platform_requirements(platform_name);

-- Enable RLS
ALTER TABLE public.platform_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role has full access
DROP POLICY IF EXISTS "Service role can manage platform requirements" ON public.platform_requirements;
CREATE POLICY "Service role can manage platform requirements"
ON public.platform_requirements
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public reads (needed for API access)
DROP POLICY IF EXISTS "Allow public read access" ON public.platform_requirements;
CREATE POLICY "Allow public read access"
ON public.platform_requirements
FOR SELECT
USING (true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_platform_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER platform_requirements_updated_at
  BEFORE UPDATE ON public.platform_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_requirements_updated_at();

-- Seed data for known platforms
INSERT INTO public.platform_requirements (platform_name, requires_payment, requires_identity, requires_le_declaration, requires_signature)
VALUES
  ('vairify', TRUE, TRUE, TRUE, TRUE),
  ('avchexx', TRUE, TRUE, FALSE, FALSE)
ON CONFLICT (platform_name) DO UPDATE
SET
  requires_payment = EXCLUDED.requires_payment,
  requires_identity = EXCLUDED.requires_identity,
  requires_le_declaration = EXCLUDED.requires_le_declaration,
  requires_signature = EXCLUDED.requires_signature,
  updated_at = NOW();

-- Add comments
COMMENT ON TABLE public.platform_requirements IS 'Defines requirement sets for each platform';
COMMENT ON COLUMN public.platform_requirements.custom_requirements IS 'JSONB field for future platform-specific requirements';









