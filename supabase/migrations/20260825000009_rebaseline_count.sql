-- RULINGS-CP-06 §4 — requested re-baseline count and period.
-- Cap is a setting, UNSET. Price is a setting, UNSET. SN-68 blocked on charge.

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS rebaseline_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS rebaseline_period_start timestamptz;

COMMENT ON COLUMN public.credentials.rebaseline_count IS
  'Requested re-baselines in the current period. Cap is a setting. RULINGS-CP-06 §4.';

-- settings.value is NOT NULL. UNSET is this schema's stored form of a null figure.
INSERT INTO public.settings (key, value)
VALUES
  ('rebaseline_cap_per_period', 'UNSET'),
  ('rebaseline_price', 'UNSET')
ON CONFLICT (key) DO NOTHING;
