-- Add LEO status to vai_assignments table
ALTER TABLE public.vai_assignments ADD COLUMN IF NOT EXISTS is_leo BOOLEAN DEFAULT false;

-- Add LEO verification metadata
ALTER TABLE public.vai_assignments ADD COLUMN IF NOT EXISTS leo_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.vai_assignments ADD COLUMN IF NOT EXISTS leo_badge_number TEXT;
ALTER TABLE public.vai_assignments ADD COLUMN IF NOT EXISTS leo_jurisdiction TEXT;

-- Create index for LEO lookups
CREATE INDEX IF NOT EXISTS idx_vai_assignments_leo_status ON public.vai_assignments(is_leo) WHERE is_leo = true;
CREATE INDEX IF NOT EXISTS idx_vai_assignments_leo_badge ON public.vai_assignments(leo_badge_number) WHERE leo_badge_number IS NOT NULL;

-- Update RLS policy to handle LEO users
-- Note: Existing policies allow authenticated users to read/update, but we can add specific LEO policy if needed
-- For now, the existing policies should work since LEO status is part of the VAI assignment

-- Add comments
COMMENT ON COLUMN public.vai_assignments.is_leo IS 'Indicates if this VAI belongs to a Law Enforcement Officer';
COMMENT ON COLUMN public.vai_assignments.leo_verified_at IS 'Timestamp when LEO status was verified';
COMMENT ON COLUMN public.vai_assignments.leo_badge_number IS 'LEO badge number for verification';
COMMENT ON COLUMN public.vai_assignments.leo_jurisdiction IS 'LEO jurisdiction (e.g., city, state, federal)';



