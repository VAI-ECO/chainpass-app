-- CP-02 §5 item 3 — retrieval page brand lives on the platform row.

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS brand text;

UPDATE public.platforms
  SET brand = COALESCE(brand, upper(display_name));

UPDATE public.platforms
  SET brand = 'VAIRIFY'
  WHERE id = 'vairify';

COMMENT ON COLUMN public.platforms.brand IS
  'Skin for the ChainPass retrieval page. One template; this value is the mark.';
