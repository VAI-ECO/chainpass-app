-- RULINGS-CP-04 — platforms.response_level. Default 1, the narrowest.

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS response_level smallint NOT NULL DEFAULT 1;

ALTER TABLE public.platforms
  DROP CONSTRAINT IF EXISTS platforms_response_level_check;

ALTER TABLE public.platforms
  ADD CONSTRAINT platforms_response_level_check
  CHECK (response_level = ANY (ARRAY[1, 2, 3]));

COMMENT ON COLUMN public.platforms.response_level IS
  '1 yes/no · 2 colour · 3 colour and percentage. Admin-adjustable. Computation is identical.';
