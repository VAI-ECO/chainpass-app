-- §16.6 step 1 / item 4 — RLS on every public application table.
-- Live previously had RLS on 2 of 16 (platform_coupons, platform_coupon_redemptions).

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname NOT LIKE 'pg_%'
    ORDER BY c.relname
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);

    -- Service role full access (edge functions / admin). Idempotent policy name per table.
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      'service_role_all_' || r.relname, r.relname);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      'service_role_all_' || r.relname, r.relname
    );
  END LOOP;
END;
$$;
