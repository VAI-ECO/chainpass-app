-- Seed inbound bank providers (§14.4). Remove = status change, never delete.
INSERT INTO public.service_registry (service_id, name, adapter, status) VALUES
  ('complycube', 'ComplyCube', 'complycube', 'active'),
  ('face_matcher', 'Face Matcher', 'face_matcher', 'active'),
  ('face_image', 'Face Image Serve', 'face_image', 'active')
ON CONFLICT (service_id) DO NOTHING;
