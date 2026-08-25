-- SPEC-CP-02 v3 §4 — five tables. Write-once by constraint and revoked privilege.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.forbid_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only (constraint, not application code)', TG_TABLE_NAME;
END;
$$;

-- Enrolment dual/single rows keep their data under a distinct name
-- so SPEC-CP-02 can occupy `agreements`.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agreements'
      AND column_name = 'vai_1'
  ) THEN
    ALTER TABLE public.agreements RENAME TO enrolment_agreements;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.contracts (
  contract_id text PRIMARY KEY,
  platform_id text NOT NULL REFERENCES public.platforms (id),
  family text NOT NULL,
  version text NOT NULL,
  body bytea NOT NULL,
  content_hash text NOT NULL,
  language text NOT NULL,
  parties smallint NOT NULL CHECK (parties IN (1, 2)),
  registered_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  registered_at_offset interval NOT NULL DEFAULT interval '0',
  registered_by text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'live', 'retired')),
  retired_at timestamptz,
  retired_at_offset interval,
  supersedes text REFERENCES public.contracts (contract_id),
  CONSTRAINT contracts_retired_at_once CHECK (
    (status <> 'retired' AND retired_at IS NULL)
    OR (status = 'retired' AND retired_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.agreements (
  agreement_id text PRIMARY KEY
    CHECK (agreement_id ~ '^AG-[A-Z0-9]{26}$'),
  contract_id text NOT NULL REFERENCES public.contracts (contract_id),
  content_hash text NOT NULL,
  platform_id text NOT NULL REFERENCES public.platforms (id),
  outcome text CHECK (outcome IN ('agreed', 'declined', 'expired')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_at_offset interval NOT NULL DEFAULT interval '0',
  closed_at timestamptz,
  closed_at_offset interval
);

CREATE INDEX IF NOT EXISTS agreements_contract_id_idx
  ON public.agreements (contract_id);

CREATE TABLE IF NOT EXISTS public.agreement_parties (
  agreement_id text NOT NULL REFERENCES public.agreements (agreement_id),
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  party_order smallint NOT NULL CHECK (party_order IN (1, 2)),
  answer text NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  answered_at_offset interval NOT NULL DEFAULT interval '0',
  match_ref text,
  PRIMARY KEY (agreement_id, vai)
);

CREATE INDEX IF NOT EXISTS agreement_parties_vai_idx
  ON public.agreement_parties (vai);

CREATE TABLE IF NOT EXISTS public.serve_events (
  serve_id bigserial PRIMARY KEY,
  agreement_id text NOT NULL REFERENCES public.agreements (agreement_id),
  contract_id text NOT NULL REFERENCES public.contracts (contract_id),
  content_hash text NOT NULL,
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  served_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  served_at_offset interval NOT NULL DEFAULT interval '0',
  delivery text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.record_ledger (
  seq bigserial PRIMARY KEY,
  table_name text NOT NULL,
  row_key text NOT NULL,
  row_hash text NOT NULL,
  prev_hash text,
  entry_hash text NOT NULL,
  written_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE OR REPLACE FUNCTION public.contracts_status_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status = 'draft' AND NEW.status = 'live')
      OR (OLD.status = 'live' AND NEW.status = 'retired')
    ) THEN
      RAISE EXCEPTION 'contracts one-way door: draft → live → retired (SPEC-CP-02 §3.2)';
    END IF;
  END IF;
  IF NEW.contract_id IS DISTINCT FROM OLD.contract_id
     OR NEW.platform_id IS DISTINCT FROM OLD.platform_id
     OR NEW.family IS DISTINCT FROM OLD.family
     OR NEW.version IS DISTINCT FROM OLD.version
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.content_hash IS DISTINCT FROM OLD.content_hash
     OR NEW.language IS DISTINCT FROM OLD.language
     OR NEW.parties IS DISTINCT FROM OLD.parties
     OR NEW.registered_at IS DISTINCT FROM OLD.registered_at
     OR NEW.registered_at_offset IS DISTINCT FROM OLD.registered_at_offset
     OR NEW.registered_by IS DISTINCT FROM OLD.registered_by
     OR NEW.supersedes IS DISTINCT FROM OLD.supersedes
  THEN
    RAISE EXCEPTION 'contracts: only status and retired_at may change (SPEC-CP-02 §4.1)';
  END IF;
  IF OLD.retired_at IS NOT NULL AND NEW.retired_at IS DISTINCT FROM OLD.retired_at THEN
    RAISE EXCEPTION 'contracts.retired_at is set once, never unset';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contracts_status_only ON public.contracts;
CREATE TRIGGER trg_contracts_status_only
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.contracts_status_only();

DROP TRIGGER IF EXISTS trg_contracts_no_delete ON public.contracts;
CREATE TRIGGER trg_contracts_no_delete
  BEFORE DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

DROP TRIGGER IF EXISTS trg_agreements_no_update ON public.agreements;
CREATE TRIGGER trg_agreements_no_update
  BEFORE UPDATE OR DELETE ON public.agreements
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

DROP TRIGGER IF EXISTS trg_agreement_parties_no_update ON public.agreement_parties;
CREATE TRIGGER trg_agreement_parties_no_update
  BEFORE UPDATE OR DELETE ON public.agreement_parties
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

DROP TRIGGER IF EXISTS trg_serve_events_no_update ON public.serve_events;
CREATE TRIGGER trg_serve_events_no_update
  BEFORE UPDATE OR DELETE ON public.serve_events
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

DROP TRIGGER IF EXISTS trg_record_ledger_no_update ON public.record_ledger;
CREATE TRIGGER trg_record_ledger_no_update
  BEFORE UPDATE OR DELETE ON public.record_ledger
  FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

CREATE OR REPLACE FUNCTION public.record_ledger_chain()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  head text;
BEGIN
  SELECT entry_hash INTO head
  FROM public.record_ledger
  ORDER BY seq DESC
  LIMIT 1;
  NEW.prev_hash := head;
  NEW.written_at := clock_timestamp();
  NEW.entry_hash := encode(
    digest(
      concat_ws(
        chr(31),
        NEW.table_name,
        NEW.row_key,
        NEW.row_hash,
        coalesce(NEW.prev_hash, ''),
        NEW.written_at::text
      ),
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_ledger_chain ON public.record_ledger;
CREATE TRIGGER trg_record_ledger_chain
  BEFORE INSERT ON public.record_ledger
  FOR EACH ROW EXECUTE FUNCTION public.record_ledger_chain();

CREATE OR REPLACE FUNCTION public.verify_record_ledger()
RETURNS TABLE (ok boolean, broken_seq bigint, detail text)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  r public.record_ledger%ROWTYPE;
  prev text;
  expected text;
BEGIN
  prev := NULL;
  FOR r IN SELECT * FROM public.record_ledger ORDER BY seq
  LOOP
    IF r.prev_hash IS DISTINCT FROM prev THEN
      ok := false;
      broken_seq := r.seq;
      detail := format('row seq=%s prev_hash does not match prior entry_hash', r.seq);
      RETURN NEXT;
      RETURN;
    END IF;
    expected := encode(
      digest(
        concat_ws(
          chr(31),
          r.table_name,
          r.row_key,
          r.row_hash,
          coalesce(r.prev_hash, ''),
          r.written_at::text
        ),
        'sha256'
      ),
      'hex'
    );
    IF r.entry_hash IS DISTINCT FROM expected THEN
      ok := false;
      broken_seq := r.seq;
      detail := format('row seq=%s entry_hash does not match recomputed chain', r.seq);
      RETURN NEXT;
      RETURN;
    END IF;
    prev := r.entry_hash;
  END LOOP;
  ok := true;
  broken_seq := NULL;
  detail := 'chain intact';
  RETURN NEXT;
END;
$$;

REVOKE UPDATE, DELETE ON
  public.agreements,
  public.agreement_parties,
  public.serve_events,
  public.record_ledger
FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT ON
  public.agreements,
  public.agreement_parties,
  public.serve_events,
  public.record_ledger
TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.contracts TO service_role;
REVOKE DELETE ON public.contracts FROM PUBLIC, anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- SPEC-CP-02 §4.5 item 2 — signed daily head, where the app database role cannot reach.
CREATE SCHEMA IF NOT EXISTS offbox;
REVOKE ALL ON SCHEMA offbox FROM PUBLIC, anon, authenticated, service_role;
CREATE TABLE IF NOT EXISTS offbox.ledger_daily_heads (
  day date PRIMARY KEY,
  head_hash text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  signature text NOT NULL
);
REVOKE ALL ON offbox.ledger_daily_heads FROM PUBLIC, anon, authenticated, service_role;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'contracts',
    'agreements',
    'agreement_parties',
    'serve_events',
    'record_ledger',
    'enrolment_agreements'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      'service_role_all_' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      'service_role_all_' || t, t
    );
  END LOOP;
END
$$;
