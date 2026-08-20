-- §16.6 step 1 / item 2 — add what §16.2 specifies and live lacks.
-- Never drops live-only tables. Live column names kept where owner-mapped
-- (document_expiry = document_expires_at; state ≈ status; display_name ≈ name).

-- platforms: §16.2 service_level + status
ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS service_level smallint
    CHECK (service_level IS NULL OR service_level IN (1, 2, 3));

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS status text
    CHECK (status IS NULL OR status IN ('active', 'suspended', 'disabled'));

UPDATE public.platforms SET status = 'active' WHERE status IS NULL;

-- credentials: §16.2 columns not yet present
ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS credential_level smallint
    CHECK (credential_level IS NULL OR credential_level IN (1, 2, 3));

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS originating_platform_id text
    REFERENCES public.platforms (id);

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS year_starts_at timestamptz;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS year_ends_at timestamptz;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS deferral_used boolean NOT NULL DEFAULT false;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS deferral_expires_at timestamptz;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

COMMENT ON COLUMN public.credentials.originating_platform_id IS
  'Platform whose API key was on the enrolment call. Nullable = house (direct). Immutable via trigger (§2.8).';
COMMENT ON COLUMN public.credentials.document_expiry IS
  'Canon §16.2 document_expires_at — live name is document_expiry (owner ruling).';
COMMENT ON COLUMN public.credentials.deferral_used IS
  'Once ever, never reset (§16.2 / §4A).';

-- settings (§16.2 / §1.1a) — create if prior migration not yet applied live
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.settings (key, value) VALUES
  ('band_green_min', '0.80'),
  ('band_yellow_min', '0.65'),
  ('attempt_count_n', '3'),
  ('engine_attempt_default', 'standard'),
  ('engine_attempt_last', 'premium'),
  ('deferral_window_hours', '48')
ON CONFLICT (key) DO NOTHING;

-- credential_keys — append-only session keys
CREATE TABLE IF NOT EXISTS public.credential_keys (
  id bigserial PRIMARY KEY,
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  session_key text NOT NULL,
  superseded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credential_keys_vai_created_at_idx
  ON public.credential_keys (vai, created_at DESC);

-- platform_agreements
CREATE TABLE IF NOT EXISTS public.platform_agreements (
  id bigserial PRIMARY KEY,
  platform_id text NOT NULL REFERENCES public.platforms (id),
  commission_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_method text,
  collection_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  terms_doc_ref text,
  terms_version text,
  required_credential_level smallint
    CHECK (required_credential_level IS NULL OR required_credential_level IN (1, 2, 3)),
  consumption_block_size integer,
  settlement_schedule text,
  signed_at timestamptz,
  version text NOT NULL DEFAULT '1',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_agreements_platform_id_idx
  ON public.platform_agreements (platform_id);

-- agreements + VERSION table (§14.2 / §16.2) — signature points at version id
CREATE TABLE IF NOT EXISTS public.agreement_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id text REFERENCES public.platforms (id),
  subtype text NOT NULL CHECK (subtype IN ('terms', 'contract')),
  body text NOT NULL,
  notice text,
  version text NOT NULL,
  effective_from timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform_id, subtype, version)
);

CREATE TABLE IF NOT EXISTS public.agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id text NOT NULL REFERENCES public.platforms (id),
  type text NOT NULL CHECK (type IN ('single', 'dual')),
  subtype text NOT NULL CHECK (subtype IN ('terms', 'contract')),
  vai_1 char(7) REFERENCES public.credentials (vai),
  vai_2 char(7) REFERENCES public.credentials (vai),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'party1_verified', 'complete', 'expired', 'void')),
  content_version_id uuid REFERENCES public.agreement_versions (id),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.agreement_proofs (
  id bigserial PRIMARY KEY,
  agreement_id uuid NOT NULL REFERENCES public.agreements (id),
  agreement_version_id uuid NOT NULL REFERENCES public.agreement_versions (id),
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  verified_at timestamptz NOT NULL DEFAULT now(),
  engine_used text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS agreement_proofs_one_pass_per_vai
  ON public.agreement_proofs (agreement_id, vai);

-- platform_visits
CREATE TABLE IF NOT EXISTS public.platform_visits (
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  platform_id text NOT NULL REFERENCES public.platforms (id),
  agreement_id uuid REFERENCES public.agreements (id),
  terms_version text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (vai, platform_id)
);

-- verification_ledger
CREATE TABLE IF NOT EXISTS public.verification_ledger (
  id bigserial PRIMARY KEY,
  platform_id text NOT NULL REFERENCES public.platforms (id),
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  call_type text NOT NULL,
  result text NOT NULL,
  billed_against_block boolean NOT NULL DEFAULT false,
  at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_ledger_platform_at_idx
  ON public.verification_ledger (platform_id, at DESC);

-- commission_ledger
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id bigserial PRIMARY KEY,
  platform_id text NOT NULL REFERENCES public.platforms (id),
  vai char(7) NOT NULL REFERENCES public.credentials (vai),
  event text NOT NULL CHECK (event IN ('origination', 'renewal')),
  amount numeric NOT NULL,
  period text,
  status text NOT NULL DEFAULT 'accrued'
    CHECK (status IN ('accrued', 'payable', 'settled')),
  trolley_recipient_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS commission_ledger_platform_status_idx
  ON public.commission_ledger (platform_id, status);

-- blocks
CREATE TABLE IF NOT EXISTS public.blocks (
  id bigserial PRIMARY KEY,
  platform_id text NOT NULL REFERENCES public.platforms (id),
  size integer NOT NULL CHECK (size > 0),
  consumed integer NOT NULL DEFAULT 0 CHECK (consumed >= 0),
  purchased_at timestamptz NOT NULL DEFAULT now()
);

-- service_registry (inbound bank §14.4)
CREATE TABLE IF NOT EXISTS public.service_registry (
  service_id text PRIMARY KEY,
  name text NOT NULL,
  adapter text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled'))
);

-- platform_services
CREATE TABLE IF NOT EXISTS public.platform_services (
  platform_id text NOT NULL REFERENCES public.platforms (id),
  service_id text NOT NULL REFERENCES public.service_registry (service_id),
  PRIMARY KEY (platform_id, service_id)
);
