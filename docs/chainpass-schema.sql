-- ChainPass public schema dump from live Hetzner (22 Aug 2026).
-- Regenerated from supabase-db. 29 base tables in public.

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: calculate_cosine_similarity(public.vector, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_cosine_similarity(baseline_vector public.vector, capture_vector text) RETURNS real
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  distance real;
begin
  -- The <=> operator calculates cosine distance
  -- Cosine similarity = 1 - cosine distance
  distance := baseline_vector <=> capture_vector::vector(512);
  return 1 - distance;
end;
$$;


--
-- Name: forbid_agreement_version_mutation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.forbid_agreement_version_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION
    'agreement_versions are immutable (CANON-CP-01 §14.2 item 3)';
END;
$$;


--
-- Name: forbid_originating_platform_id_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.forbid_originating_platform_id_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.originating_platform_id IS DISTINCT FROM OLD.originating_platform_id THEN
    RAISE EXCEPTION
      'originating_platform_id is immutable (CANON-CP-01 §2.8 item 1 / §15 item 5)';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: increment_coupon_used_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_coupon_used_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  -- Only increment when payment reaches 'paid' state and has a coupon
  if new.state = 'paid' and new.coupon_code is not null and
     (tg_op = 'INSERT' or old.state != 'paid') then

    update platform_coupons
    set used_count = used_count + 1
    where code = new.coupon_code;

  end if;

  return new;
end;
$$;


--
-- Name: FUNCTION increment_coupon_used_count(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_coupon_used_count() IS 'Increments platform_coupons.used_count when payment reaches paid state. Handles both INSERT (hosted checkout) and UPDATE (standard flow).';


--
-- Name: set_credential_dates(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_credential_dates(p_issued date, p_document_expiry date) RETURNS TABLE(next_renewal date, next_complycube date)
    LANGUAGE sql IMMUTABLE
    AS $$
  select
    p_issued + interval '1 year',
    least(p_document_expiry, p_issued + interval '3 years');
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agreement_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreement_proofs (
    id bigint NOT NULL,
    agreement_id uuid NOT NULL,
    agreement_version_id uuid NOT NULL,
    vai character(7) NOT NULL,
    verified_at timestamp with time zone DEFAULT now() NOT NULL,
    engine_used text NOT NULL
);


--
-- Name: agreement_proofs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agreement_proofs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agreement_proofs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agreement_proofs_id_seq OWNED BY public.agreement_proofs.id;


--
-- Name: agreement_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreement_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id text,
    subtype text NOT NULL,
    body text NOT NULL,
    notice text,
    version text NOT NULL,
    effective_from timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agreement_versions_subtype_check CHECK ((subtype = ANY (ARRAY['terms'::text, 'contract'::text])))
);


--
-- Name: agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_id text NOT NULL,
    type text NOT NULL,
    subtype text NOT NULL,
    vai_1 character(7),
    vai_2 character(7),
    status text DEFAULT 'open'::text NOT NULL,
    content_version_id uuid,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    expires_at timestamp with time zone,
    CONSTRAINT agreements_status_check CHECK ((status = ANY (ARRAY['open'::text, 'party1_verified'::text, 'complete'::text, 'expired'::text, 'void'::text]))),
    CONSTRAINT agreements_subtype_check CHECK ((subtype = ANY (ARRAY['terms'::text, 'contract'::text]))),
    CONSTRAINT agreements_type_check CHECK ((type = ANY (ARRAY['single'::text, 'dual'::text])))
);


--
-- Name: baselines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baselines (
    id bigint NOT NULL,
    vai character(7) NOT NULL,
    vector public.vector(512) NOT NULL,
    model text NOT NULL,
    model_version text NOT NULL,
    enrollment_score real NOT NULL,
    variance_score real,
    photo_ref text,
    source text DEFAULT 'complycube'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT baselines_source_check CHECK ((source = ANY (ARRAY['complycube'::text, 'in_house'::text])))
);


--
-- Name: baselines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.baselines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: baselines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.baselines_id_seq OWNED BY public.baselines.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocks (
    id bigint NOT NULL,
    platform_id text NOT NULL,
    size integer NOT NULL,
    consumed integer DEFAULT 0 NOT NULL,
    purchased_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blocks_consumed_check CHECK ((consumed >= 0)),
    CONSTRAINT blocks_size_check CHECK ((size > 0))
);


--
-- Name: blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blocks_id_seq OWNED BY public.blocks.id;


--
-- Name: commission_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commission_ledger (
    id bigint NOT NULL,
    platform_id text NOT NULL,
    vai character(7) NOT NULL,
    event text NOT NULL,
    amount numeric NOT NULL,
    period text,
    status text DEFAULT 'accrued'::text NOT NULL,
    trolley_recipient_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT commission_ledger_event_check CHECK ((event = ANY (ARRAY['origination'::text, 'renewal'::text]))),
    CONSTRAINT commission_ledger_status_check CHECK ((status = ANY (ARRAY['accrued'::text, 'payable'::text, 'settled'::text])))
);


--
-- Name: commission_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.commission_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: commission_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.commission_ledger_id_seq OWNED BY public.commission_ledger.id;


--
-- Name: credential_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credential_events (
    id bigint NOT NULL,
    event_id text NOT NULL,
    emission_id text NOT NULL,
    platform_id text NOT NULL,
    vai character(7) NOT NULL,
    type text NOT NULL,
    payload jsonb NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credential_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credential_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credential_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credential_events_id_seq OWNED BY public.credential_events.id;


--
-- Name: credential_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credential_keys (
    id bigint NOT NULL,
    vai character(7) NOT NULL,
    session_key text,
    superseded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credential_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credential_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credential_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credential_keys_id_seq OWNED BY public.credential_keys.id;


--
-- Name: credential_platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credential_platforms (
    vai character(7) NOT NULL,
    platform_id text NOT NULL,
    first_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    state text DEFAULT 'active'::text NOT NULL,
    state_note text,
    state_at timestamp with time zone,
    CONSTRAINT credential_platforms_state_check CHECK ((state = ANY (ARRAY['active'::text, 'rejected'::text])))
);


--
-- Name: credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credentials (
    vai character(7) NOT NULL,
    state text DEFAULT 'active'::text NOT NULL,
    document_expiry date,
    next_renewal_date date NOT NULL,
    next_complycube_date date,
    screening_state text DEFAULT 'pending'::text NOT NULL,
    screening_note text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    state_changed_at timestamp with time zone DEFAULT now() NOT NULL,
    provisional boolean DEFAULT false NOT NULL,
    credential_level smallint,
    originating_platform_id text,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    year_starts_at timestamp with time zone,
    year_ends_at timestamp with time zone,
    deferral_used boolean DEFAULT false NOT NULL,
    deferral_expires_at timestamp with time zone,
    paid_at timestamp with time zone,
    CONSTRAINT credentials_credential_level_check CHECK (((credential_level IS NULL) OR (credential_level = ANY (ARRAY[1, 2, 3])))),
    CONSTRAINT credentials_screening_state_check CHECK ((screening_state = ANY (ARRAY['pending'::text, 'clear'::text, 'flagged'::text]))),
    CONSTRAINT credentials_state_check CHECK ((state = ANY (ARRAY['active'::text, 'expiring'::text, 'expired'::text, 'awaiting'::text, 'locked'::text, 'suspended'::text, 'banned'::text])))
);


--
-- Name: COLUMN credentials.document_expiry; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credentials.document_expiry IS 'Canon §16.2 document_expires_at — live name is document_expiry (owner ruling).';


--
-- Name: COLUMN credentials.originating_platform_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credentials.originating_platform_id IS 'Platform whose API key was on the enrolment call. Nullable = house (direct). Immutable via trigger (§2.8).';


--
-- Name: COLUMN credentials.deferral_used; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credentials.deferral_used IS 'Once ever, never reset (§16.2 / §4A).';


--
-- Name: facial_signature_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facial_signature_attempts (
    id bigint NOT NULL,
    session_id text NOT NULL,
    success boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: facial_signature_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.facial_signature_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: facial_signature_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.facial_signature_attempts_id_seq OWNED BY public.facial_signature_attempts.id;


--
-- Name: facial_verification_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facial_verification_attempts (
    id bigint NOT NULL,
    vai character(7) NOT NULL,
    platform_id text NOT NULL,
    success boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: facial_verification_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.facial_verification_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: facial_verification_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.facial_verification_attempts_id_seq OWNED BY public.facial_verification_attempts.id;


--
-- Name: lookup_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lookup_log (
    id bigint NOT NULL,
    platform_id text NOT NULL,
    vai character(7) NOT NULL,
    found boolean NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lookup_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lookup_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lookup_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lookup_log_id_seq OWNED BY public.lookup_log.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    session_id text NOT NULL,
    vai character(7),
    processor text NOT NULL,
    processor_reference text NOT NULL,
    amount_cents integer NOT NULL,
    currency character(3) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    state text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    coupon_code text,
    discount_cents integer DEFAULT 0 NOT NULL,
    CONSTRAINT payments_discount_cents_check CHECK ((discount_cents >= 0)),
    CONSTRAINT payments_state_check CHECK ((state = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])))
);


--
-- Name: COLUMN payments.coupon_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.coupon_code IS 'Coupon applied to this payment. NULL if no coupon used.';


--
-- Name: COLUMN payments.discount_cents; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.discount_cents IS 'Discount applied in cents. payments.discount_cents + amount_charged = full price.';


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: platform_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_agreements (
    id bigint NOT NULL,
    platform_id text NOT NULL,
    commission_rules jsonb DEFAULT '{}'::jsonb NOT NULL,
    payment_method text,
    collection_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    terms_doc_ref text NOT NULL,
    terms_version text NOT NULL,
    required_credential_level smallint,
    consumption_block_size integer,
    settlement_schedule text,
    signed_at timestamp with time zone,
    version text DEFAULT '1'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deferral_offered boolean DEFAULT false NOT NULL,
    deferral_window_hours integer,
    CONSTRAINT platform_agreements_required_credential_level_check CHECK (((required_credential_level IS NULL) OR (required_credential_level = ANY (ARRAY[1, 2, 3]))))
);


--
-- Name: COLUMN platform_agreements.deferral_offered; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.platform_agreements.deferral_offered IS '§4A — if true, pay screen may offer deferral; window from deferral_window_hours or settings.deferral_window_hours.';


--
-- Name: platform_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_agreements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_agreements_id_seq OWNED BY public.platform_agreements.id;


--
-- Name: platform_coupon_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_coupon_redemptions (
    id bigint NOT NULL,
    code text NOT NULL,
    session_id text NOT NULL,
    vai character(7),
    expires_at timestamp with time zone NOT NULL,
    redeemed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE platform_coupon_redemptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.platform_coupon_redemptions IS 'Coupon reservations. Created when coupon applied to session. Expires with session to prevent blocking availability.';


--
-- Name: COLUMN platform_coupon_redemptions.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.platform_coupon_redemptions.expires_at IS 'Copied from session.expires_at. Reservation only counts toward availability if not expired.';


--
-- Name: platform_coupon_redemptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_coupon_redemptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_coupon_redemptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_coupon_redemptions_id_seq OWNED BY public.platform_coupon_redemptions.id;


--
-- Name: platform_coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_coupons (
    code text NOT NULL,
    platform_id text NOT NULL,
    percent_off integer,
    amount_off integer,
    max_uses integer NOT NULL,
    used_count integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exactly_one_discount CHECK (((((percent_off IS NOT NULL))::integer + ((amount_off IS NOT NULL))::integer) = 1)),
    CONSTRAINT platform_coupons_amount_off_check CHECK ((amount_off > 0)),
    CONSTRAINT platform_coupons_max_uses_check CHECK ((max_uses > 0)),
    CONSTRAINT platform_coupons_percent_off_check CHECK (((percent_off > 0) AND (percent_off <= 100))),
    CONSTRAINT platform_coupons_used_count_check CHECK ((used_count >= 0))
);


--
-- Name: TABLE platform_coupons; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.platform_coupons IS 'Platform-specific discount codes. max_uses is a hard limit - code dies when limit reached.';


--
-- Name: COLUMN platform_coupons.used_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.platform_coupons.used_count IS 'Increments ONLY on successful payment (state=paid). Never decrements.';


--
-- Name: platform_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_requirements (
    platform_id text NOT NULL,
    requirement_key text NOT NULL,
    effective_from date NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: platform_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_services (
    platform_id text NOT NULL,
    service_id text NOT NULL
);


--
-- Name: platform_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_visits (
    vai character(7) NOT NULL,
    platform_id text NOT NULL,
    agreement_id uuid,
    terms_version text,
    signed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platforms (
    id text NOT NULL,
    display_name text NOT NULL,
    webhook_url text,
    webhook_secret text,
    webhook_state text DEFAULT 'active'::text NOT NULL,
    api_key_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    base_price_cents integer,
    service_level smallint,
    status text,
    CONSTRAINT platforms_service_level_check CHECK (((service_level IS NULL) OR (service_level = ANY (ARRAY[1, 2, 3])))),
    CONSTRAINT platforms_status_check CHECK (((status IS NULL) OR (status = ANY (ARRAY['active'::text, 'suspended'::text, 'disabled'::text])))),
    CONSTRAINT platforms_webhook_state_check CHECK ((webhook_state = ANY (ARRAY['active'::text, 'failing'::text, 'disabled'::text])))
);


--
-- Name: COLUMN platforms.base_price_cents; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.platforms.base_price_cents IS 'Base price in cents for this platform. Required for percentage-based coupons. NULL if platform uses custom pricing.';


--
-- Name: requirement_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirement_completions (
    vai character(7) NOT NULL,
    requirement_key text NOT NULL,
    platform_id text NOT NULL,
    signed_version text NOT NULL,
    signed_at timestamp with time zone DEFAULT now() NOT NULL,
    affirmation_version text DEFAULT ''::text NOT NULL,
    id bigint NOT NULL
);


--
-- Name: requirement_completions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.requirement_completions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requirement_completions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.requirement_completions_id_seq OWNED BY public.requirement_completions.id;


--
-- Name: requirement_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirement_versions (
    requirement_key text NOT NULL,
    version text NOT NULL,
    body text NOT NULL,
    effective_from date NOT NULL
);


--
-- Name: requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirements (
    key text NOT NULL,
    display_name text NOT NULL,
    kind text NOT NULL,
    ecosystem_wide boolean DEFAULT false NOT NULL,
    CONSTRAINT requirements_kind_check CHECK ((kind = ANY (ARRAY['declaration'::text, 'agreement'::text, 'release'::text, 'check'::text])))
);


--
-- Name: service_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_registry (
    service_id text NOT NULL,
    name text NOT NULL,
    adapter text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    CONSTRAINT service_registry_status_check CHECK ((status = ANY (ARRAY['active'::text, 'disabled'::text])))
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    platform_id text NOT NULL,
    vai character(7),
    route text NOT NULL,
    state text DEFAULT 'open'::text NOT NULL,
    complycube_session_id text,
    platform_session_ref text,
    platform_return_url text,
    frame text,
    return_url text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    enrolment_step smallint DEFAULT 1 NOT NULL,
    biometric_consent_at timestamp with time zone,
    username text,
    contact_email text,
    contact_phone text,
    otp_verified_at timestamp with time zone,
    held_capture text,
    held_capture_voided_at timestamp with time zone,
    provider_session_key text,
    warning_acked_at timestamp with time zone,
    paid_at timestamp with time zone,
    payment_choice text,
    price_charged text,
    required_credential_level smallint,
    requirements_signed_at timestamp with time zone,
    congratulations_at timestamp with time zone,
    CONSTRAINT sessions_enrolment_step_check CHECK (((enrolment_step >= 1) AND (enrolment_step <= 11))),
    CONSTRAINT sessions_frame_check CHECK ((frame = ANY (ARRAY['A'::text, 'B'::text]))),
    CONSTRAINT sessions_payment_choice_check CHECK (((payment_choice IS NULL) OR (payment_choice = ANY (ARRAY['pay'::text, 'defer'::text])))),
    CONSTRAINT sessions_required_credential_level_check CHECK (((required_credential_level IS NULL) OR (required_credential_level = ANY (ARRAY[1, 2, 3])))),
    CONSTRAINT sessions_route_check CHECK ((route = ANY (ARRAY['enrollment'::text, 'rebaseline'::text, 'unlock'::text, 'renewal'::text]))),
    CONSTRAINT sessions_state_check CHECK ((state = ANY (ARRAY['open'::text, 'at_provider'::text, 'processing'::text, 'queued'::text, 'complete'::text, 'failed'::text, 'expired'::text])))
);


--
-- Name: COLUMN sessions.held_capture; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.held_capture IS 'Step-6 simultaneous frame. Held until step 9; voided on camera-session break (§2.7 5a).';


--
-- Name: COLUMN sessions.provider_session_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.provider_session_key IS 'Deleted at handoff. ChainPass must not retain after delivery (§2.4a).';


--
-- Name: COLUMN sessions.requirements_signed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.requirements_signed_at IS '§2 step 8 — platform requirements (signature agreement + elected docs) signed after V.A.I. live.';


--
-- Name: COLUMN sessions.congratulations_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.congratulations_at IS '§2 step 10 — congratulations after baseline commit; precedes handoff.';


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: verification_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_ledger (
    id bigint NOT NULL,
    platform_id text NOT NULL,
    vai character(7) NOT NULL,
    call_type text NOT NULL,
    result text NOT NULL,
    billed_against_block boolean DEFAULT false NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: verification_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.verification_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: verification_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.verification_ledger_id_seq OWNED BY public.verification_ledger.id;


--
-- Name: verification_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    complycube_verification_id text,
    verification_status text,
    biometric_confirmed boolean DEFAULT false NOT NULL,
    selfie_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agreement_proofs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_proofs ALTER COLUMN id SET DEFAULT nextval('public.agreement_proofs_id_seq'::regclass);


--
-- Name: baselines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baselines ALTER COLUMN id SET DEFAULT nextval('public.baselines_id_seq'::regclass);


--
-- Name: blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks ALTER COLUMN id SET DEFAULT nextval('public.blocks_id_seq'::regclass);


--
-- Name: commission_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_ledger ALTER COLUMN id SET DEFAULT nextval('public.commission_ledger_id_seq'::regclass);


--
-- Name: credential_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_events ALTER COLUMN id SET DEFAULT nextval('public.credential_events_id_seq'::regclass);


--
-- Name: credential_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_keys ALTER COLUMN id SET DEFAULT nextval('public.credential_keys_id_seq'::regclass);


--
-- Name: facial_signature_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_signature_attempts ALTER COLUMN id SET DEFAULT nextval('public.facial_signature_attempts_id_seq'::regclass);


--
-- Name: facial_verification_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_verification_attempts ALTER COLUMN id SET DEFAULT nextval('public.facial_verification_attempts_id_seq'::regclass);


--
-- Name: lookup_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_log ALTER COLUMN id SET DEFAULT nextval('public.lookup_log_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: platform_agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_agreements ALTER COLUMN id SET DEFAULT nextval('public.platform_agreements_id_seq'::regclass);


--
-- Name: platform_coupon_redemptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupon_redemptions ALTER COLUMN id SET DEFAULT nextval('public.platform_coupon_redemptions_id_seq'::regclass);


--
-- Name: requirement_completions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_completions ALTER COLUMN id SET DEFAULT nextval('public.requirement_completions_id_seq'::regclass);


--
-- Name: verification_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_ledger ALTER COLUMN id SET DEFAULT nextval('public.verification_ledger_id_seq'::regclass);


--
-- Name: agreement_proofs agreement_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_proofs
    ADD CONSTRAINT agreement_proofs_pkey PRIMARY KEY (id);


--
-- Name: agreement_versions agreement_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_versions
    ADD CONSTRAINT agreement_versions_pkey PRIMARY KEY (id);


--
-- Name: agreement_versions agreement_versions_platform_id_subtype_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_versions
    ADD CONSTRAINT agreement_versions_platform_id_subtype_version_key UNIQUE (platform_id, subtype, version);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: baselines baselines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baselines
    ADD CONSTRAINT baselines_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: commission_ledger commission_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_ledger
    ADD CONSTRAINT commission_ledger_pkey PRIMARY KEY (id);


--
-- Name: credential_events credential_events_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_event_id_key UNIQUE (event_id);


--
-- Name: credential_events credential_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_pkey PRIMARY KEY (id);


--
-- Name: credential_keys credential_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_keys
    ADD CONSTRAINT credential_keys_pkey PRIMARY KEY (id);


--
-- Name: credential_platforms credential_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_platforms
    ADD CONSTRAINT credential_platforms_pkey PRIMARY KEY (vai, platform_id);


--
-- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_pkey PRIMARY KEY (vai);


--
-- Name: facial_signature_attempts facial_signature_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_signature_attempts
    ADD CONSTRAINT facial_signature_attempts_pkey PRIMARY KEY (id);


--
-- Name: facial_verification_attempts facial_verification_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_verification_attempts
    ADD CONSTRAINT facial_verification_attempts_pkey PRIMARY KEY (id);


--
-- Name: lookup_log lookup_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_log
    ADD CONSTRAINT lookup_log_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_agreements platform_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_agreements
    ADD CONSTRAINT platform_agreements_pkey PRIMARY KEY (id);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_pkey PRIMARY KEY (id);


--
-- Name: platform_coupons platform_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupons
    ADD CONSTRAINT platform_coupons_pkey PRIMARY KEY (code);


--
-- Name: platform_requirements platform_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_requirements
    ADD CONSTRAINT platform_requirements_pkey PRIMARY KEY (platform_id, requirement_key);


--
-- Name: platform_services platform_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_services
    ADD CONSTRAINT platform_services_pkey PRIMARY KEY (platform_id, service_id);


--
-- Name: platform_visits platform_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_visits
    ADD CONSTRAINT platform_visits_pkey PRIMARY KEY (vai, platform_id);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (id);


--
-- Name: requirement_completions requirement_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_pkey PRIMARY KEY (id);


--
-- Name: requirement_versions requirement_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_versions
    ADD CONSTRAINT requirement_versions_pkey PRIMARY KEY (requirement_key, version);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (key);


--
-- Name: service_registry service_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_registry
    ADD CONSTRAINT service_registry_pkey PRIMARY KEY (service_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: verification_ledger verification_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_ledger
    ADD CONSTRAINT verification_ledger_pkey PRIMARY KEY (id);


--
-- Name: verification_records verification_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_records
    ADD CONSTRAINT verification_records_pkey PRIMARY KEY (id);


--
-- Name: verification_records verification_records_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_records
    ADD CONSTRAINT verification_records_session_id_key UNIQUE (session_id);


--
-- Name: agreement_proofs_one_pass_per_vai; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX agreement_proofs_one_pass_per_vai ON public.agreement_proofs USING btree (agreement_id, vai);


--
-- Name: baselines_vai_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX baselines_vai_created_at_idx ON public.baselines USING btree (vai, created_at DESC);


--
-- Name: commission_ledger_platform_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commission_ledger_platform_status_idx ON public.commission_ledger USING btree (platform_id, status);


--
-- Name: credential_events_emission_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX credential_events_emission_id_idx ON public.credential_events USING btree (emission_id);


--
-- Name: credential_events_platform_id_delivered_at_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX credential_events_platform_id_delivered_at_created_at_idx ON public.credential_events USING btree (platform_id, delivered_at NULLS FIRST, created_at);


--
-- Name: credential_keys_vai_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX credential_keys_vai_created_at_idx ON public.credential_keys USING btree (vai, created_at DESC);


--
-- Name: facial_signature_attempts_session_id_attempted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facial_signature_attempts_session_id_attempted_at_idx ON public.facial_signature_attempts USING btree (session_id, attempted_at DESC);


--
-- Name: facial_verification_attempts_vai_platform_id_attempted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facial_verification_attempts_vai_platform_id_attempted_at_idx ON public.facial_verification_attempts USING btree (vai, platform_id, attempted_at DESC);


--
-- Name: payments_coupon_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_coupon_code_idx ON public.payments USING btree (coupon_code) WHERE (coupon_code IS NOT NULL);


--
-- Name: payments_vai_period_end_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_vai_period_end_idx ON public.payments USING btree (vai, period_end DESC);


--
-- Name: platform_agreements_platform_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_agreements_platform_id_idx ON public.platform_agreements USING btree (platform_id);


--
-- Name: platform_coupon_redemptions_code_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_coupon_redemptions_code_expires_at_idx ON public.platform_coupon_redemptions USING btree (code, expires_at);


--
-- Name: platform_coupon_redemptions_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX platform_coupon_redemptions_session_id_idx ON public.platform_coupon_redemptions USING btree (session_id);


--
-- Name: platform_coupon_redemptions_vai_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_coupon_redemptions_vai_idx ON public.platform_coupon_redemptions USING btree (vai) WHERE (vai IS NOT NULL);


--
-- Name: platform_coupons_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_coupons_expires_at_idx ON public.platform_coupons USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: platform_coupons_platform_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX platform_coupons_platform_id_idx ON public.platform_coupons USING btree (platform_id);


--
-- Name: requirement_completions_vai_req_platform_signed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requirement_completions_vai_req_platform_signed_idx ON public.requirement_completions USING btree (vai, requirement_key, platform_id, signed_at DESC);


--
-- Name: verification_ledger_platform_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_ledger_platform_at_idx ON public.verification_ledger USING btree (platform_id, at DESC);


--
-- Name: verification_records_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_records_session_id_idx ON public.verification_records USING btree (session_id);


--
-- Name: payments payment_increments_coupon_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER payment_increments_coupon_count AFTER INSERT OR UPDATE OF state ON public.payments FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_used_count();


--
-- Name: agreement_versions trg_agreement_versions_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_agreement_versions_immutable BEFORE DELETE OR UPDATE ON public.agreement_versions FOR EACH ROW EXECUTE FUNCTION public.forbid_agreement_version_mutation();


--
-- Name: credentials trg_credentials_originating_platform_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_credentials_originating_platform_immutable BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.forbid_originating_platform_id_update();


--
-- Name: agreement_proofs agreement_proofs_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_proofs
    ADD CONSTRAINT agreement_proofs_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.agreements(id);


--
-- Name: agreement_proofs agreement_proofs_agreement_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_proofs
    ADD CONSTRAINT agreement_proofs_agreement_version_id_fkey FOREIGN KEY (agreement_version_id) REFERENCES public.agreement_versions(id);


--
-- Name: agreement_proofs agreement_proofs_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_proofs
    ADD CONSTRAINT agreement_proofs_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: agreement_versions agreement_versions_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_versions
    ADD CONSTRAINT agreement_versions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: agreements agreements_content_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_content_version_id_fkey FOREIGN KEY (content_version_id) REFERENCES public.agreement_versions(id);


--
-- Name: agreements agreements_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: agreements agreements_vai_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_vai_1_fkey FOREIGN KEY (vai_1) REFERENCES public.credentials(vai);


--
-- Name: agreements agreements_vai_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_vai_2_fkey FOREIGN KEY (vai_2) REFERENCES public.credentials(vai);


--
-- Name: baselines baselines_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baselines
    ADD CONSTRAINT baselines_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: blocks blocks_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: commission_ledger commission_ledger_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_ledger
    ADD CONSTRAINT commission_ledger_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: commission_ledger commission_ledger_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_ledger
    ADD CONSTRAINT commission_ledger_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: credential_events credential_events_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: credential_events credential_events_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: credential_keys credential_keys_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_keys
    ADD CONSTRAINT credential_keys_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: credential_platforms credential_platforms_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_platforms
    ADD CONSTRAINT credential_platforms_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: credential_platforms credential_platforms_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credential_platforms
    ADD CONSTRAINT credential_platforms_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: credentials credentials_originating_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_originating_platform_id_fkey FOREIGN KEY (originating_platform_id) REFERENCES public.platforms(id);


--
-- Name: facial_signature_attempts facial_signature_attempts_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_signature_attempts
    ADD CONSTRAINT facial_signature_attempts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: facial_verification_attempts facial_verification_attempts_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_verification_attempts
    ADD CONSTRAINT facial_verification_attempts_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: facial_verification_attempts facial_verification_attempts_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facial_verification_attempts
    ADD CONSTRAINT facial_verification_attempts_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: lookup_log lookup_log_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_log
    ADD CONSTRAINT lookup_log_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: payments payments_coupon_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_coupon_code_fkey FOREIGN KEY (coupon_code) REFERENCES public.platform_coupons(code);


--
-- Name: payments payments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: payments payments_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: platform_agreements platform_agreements_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_agreements
    ADD CONSTRAINT platform_agreements_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_code_fkey FOREIGN KEY (code) REFERENCES public.platform_coupons(code);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: platform_coupons platform_coupons_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_coupons
    ADD CONSTRAINT platform_coupons_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_requirements platform_requirements_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_requirements
    ADD CONSTRAINT platform_requirements_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_requirements platform_requirements_requirement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_requirements
    ADD CONSTRAINT platform_requirements_requirement_key_fkey FOREIGN KEY (requirement_key) REFERENCES public.requirements(key);


--
-- Name: platform_services platform_services_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_services
    ADD CONSTRAINT platform_services_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_services platform_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_services
    ADD CONSTRAINT platform_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.service_registry(service_id);


--
-- Name: platform_visits platform_visits_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_visits
    ADD CONSTRAINT platform_visits_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.agreements(id);


--
-- Name: platform_visits platform_visits_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_visits
    ADD CONSTRAINT platform_visits_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_visits platform_visits_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_visits
    ADD CONSTRAINT platform_visits_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: requirement_completions requirement_completions_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: requirement_completions requirement_completions_requirement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_requirement_key_fkey FOREIGN KEY (requirement_key) REFERENCES public.requirements(key);


--
-- Name: requirement_completions requirement_completions_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: requirement_versions requirement_versions_requirement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement_versions
    ADD CONSTRAINT requirement_versions_requirement_key_fkey FOREIGN KEY (requirement_key) REFERENCES public.requirements(key);


--
-- Name: sessions sessions_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: sessions sessions_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: verification_ledger verification_ledger_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_ledger
    ADD CONSTRAINT verification_ledger_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: verification_ledger verification_ledger_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_ledger
    ADD CONSTRAINT verification_ledger_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: platform_coupons Service role manages coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role manages coupons" ON public.platform_coupons TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_coupon_redemptions Service role manages redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role manages redemptions" ON public.platform_coupon_redemptions TO service_role USING (true) WITH CHECK (true);


--
-- Name: agreement_proofs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agreement_proofs ENABLE ROW LEVEL SECURITY;

--
-- Name: agreement_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agreement_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: agreements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

--
-- Name: settings anon_read_display_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY anon_read_display_settings ON public.settings FOR SELECT TO authenticated, anon USING ((key = ANY (ARRAY['price_vai'::text, 'price_vai_pro'::text, 'deferral_window_hours'::text])));


--
-- Name: baselines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.baselines ENABLE ROW LEVEL SECURITY;

--
-- Name: blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: commission_ledger; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;

--
-- Name: credential_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credential_events ENABLE ROW LEVEL SECURITY;

--
-- Name: credential_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credential_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: credential_platforms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credential_platforms ENABLE ROW LEVEL SECURITY;

--
-- Name: credentials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

--
-- Name: facial_signature_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.facial_signature_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: facial_verification_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.facial_verification_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: lookup_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lookup_log ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_agreements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_agreements ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_coupon_redemptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_coupon_redemptions ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_requirements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_requirements ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_services ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_visits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_visits ENABLE ROW LEVEL SECURITY;

--
-- Name: platforms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

--
-- Name: requirement_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.requirement_completions ENABLE ROW LEVEL SECURITY;

--
-- Name: requirement_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.requirement_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: requirements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

--
-- Name: service_registry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_registry ENABLE ROW LEVEL SECURITY;

--
-- Name: agreement_proofs service_role_all_agreement_proofs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_agreement_proofs ON public.agreement_proofs TO service_role USING (true) WITH CHECK (true);


--
-- Name: agreement_versions service_role_all_agreement_versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_agreement_versions ON public.agreement_versions TO service_role USING (true) WITH CHECK (true);


--
-- Name: agreements service_role_all_agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_agreements ON public.agreements TO service_role USING (true) WITH CHECK (true);


--
-- Name: baselines service_role_all_baselines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_baselines ON public.baselines TO service_role USING (true) WITH CHECK (true);


--
-- Name: blocks service_role_all_blocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_blocks ON public.blocks TO service_role USING (true) WITH CHECK (true);


--
-- Name: commission_ledger service_role_all_commission_ledger; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_commission_ledger ON public.commission_ledger TO service_role USING (true) WITH CHECK (true);


--
-- Name: credential_events service_role_all_credential_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_credential_events ON public.credential_events TO service_role USING (true) WITH CHECK (true);


--
-- Name: credential_keys service_role_all_credential_keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_credential_keys ON public.credential_keys TO service_role USING (true) WITH CHECK (true);


--
-- Name: credential_platforms service_role_all_credential_platforms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_credential_platforms ON public.credential_platforms TO service_role USING (true) WITH CHECK (true);


--
-- Name: credentials service_role_all_credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_credentials ON public.credentials TO service_role USING (true) WITH CHECK (true);


--
-- Name: facial_signature_attempts service_role_all_facial_signature_attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_facial_signature_attempts ON public.facial_signature_attempts TO service_role USING (true) WITH CHECK (true);


--
-- Name: facial_verification_attempts service_role_all_facial_verification_attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_facial_verification_attempts ON public.facial_verification_attempts TO service_role USING (true) WITH CHECK (true);


--
-- Name: lookup_log service_role_all_lookup_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_lookup_log ON public.lookup_log TO service_role USING (true) WITH CHECK (true);


--
-- Name: payments service_role_all_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_payments ON public.payments TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_agreements service_role_all_platform_agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platform_agreements ON public.platform_agreements TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_coupon_redemptions service_role_all_platform_coupon_redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platform_coupon_redemptions ON public.platform_coupon_redemptions TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_coupons service_role_all_platform_coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platform_coupons ON public.platform_coupons TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_requirements service_role_all_platform_requirements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platform_requirements ON public.platform_requirements TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_services service_role_all_platform_services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platform_services ON public.platform_services TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_visits service_role_all_platform_visits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platform_visits ON public.platform_visits TO service_role USING (true) WITH CHECK (true);


--
-- Name: platforms service_role_all_platforms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_platforms ON public.platforms TO service_role USING (true) WITH CHECK (true);


--
-- Name: requirement_completions service_role_all_requirement_completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_requirement_completions ON public.requirement_completions TO service_role USING (true) WITH CHECK (true);


--
-- Name: requirement_versions service_role_all_requirement_versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_requirement_versions ON public.requirement_versions TO service_role USING (true) WITH CHECK (true);


--
-- Name: requirements service_role_all_requirements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_requirements ON public.requirements TO service_role USING (true) WITH CHECK (true);


--
-- Name: service_registry service_role_all_service_registry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_service_registry ON public.service_registry TO service_role USING (true) WITH CHECK (true);


--
-- Name: sessions service_role_all_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_sessions ON public.sessions TO service_role USING (true) WITH CHECK (true);


--
-- Name: settings service_role_all_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_settings ON public.settings TO service_role USING (true) WITH CHECK (true);


--
-- Name: verification_ledger service_role_all_verification_ledger; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_verification_ledger ON public.verification_ledger TO service_role USING (true) WITH CHECK (true);


--
-- Name: verification_records service_role_all_verification_records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_all_verification_records ON public.verification_records TO service_role USING (true) WITH CHECK (true);


--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_ledger; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_ledger ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

