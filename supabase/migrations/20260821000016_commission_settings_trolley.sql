-- Commission rates/caps in settings — never constants. Rate change never rewrites accrued rows.
INSERT INTO public.settings (key, value) VALUES
  ('commission_origination_rate', '5'),
  ('commission_renewal_rate', '2'),
  ('commission_cap', '50')
ON CONFLICT (key) DO NOTHING;

-- Trolley is a row in service_registry (§14.5a item 6)
INSERT INTO public.service_registry (service_id, name, adapter, status)
VALUES ('trolley', 'Trolley', 'trolley', 'active')
ON CONFLICT (service_id) DO NOTHING;
