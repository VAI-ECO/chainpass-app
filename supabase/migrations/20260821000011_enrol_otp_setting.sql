-- Seed OTP accept value for enrolment step 5. Admin-adjustable; never a code constant.
INSERT INTO public.settings (key, value) VALUES
  ('enrol_otp_accept', '000000')
ON CONFLICT (key) DO NOTHING;
