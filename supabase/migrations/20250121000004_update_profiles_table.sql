-- Update profiles table to support existing VAI number tracking
-- This allows Vairify to track which users used existing VAI numbers vs creating new ones

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS existing_vai_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vai_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS vai_number TEXT;

-- Create index for VAI number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vai_number ON public.profiles(vai_number) WHERE vai_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_vai_source ON public.profiles(vai_source) WHERE vai_source IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.profiles.existing_vai_used IS 'True if user signed up with an existing VAI number from another platform';
COMMENT ON COLUMN public.profiles.vai_source IS 'Source of VAI: chainpass_new, avchexx, or other platform name';
COMMENT ON COLUMN public.profiles.vai_number IS 'The VAI number associated with this profile';









