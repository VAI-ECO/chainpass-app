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
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: calculate_cosine_similarity(public.vector, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.calculate_cosine_similarity(baseline_vector public.vector, capture_vector text) OWNER TO postgres;

--
-- Name: increment_coupon_used_count(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.increment_coupon_used_count() OWNER TO postgres;

--
-- Name: FUNCTION increment_coupon_used_count(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.increment_coupon_used_count() IS 'Increments platform_coupons.used_count when payment reaches paid state. Handles both INSERT (hosted checkout) and UPDATE (standard flow).';


--
-- Name: set_credential_dates(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_credential_dates(p_issued date, p_document_expiry date) RETURNS TABLE(next_renewal date, next_complycube date)
    LANGUAGE sql IMMUTABLE
    AS $$
  select
    p_issued + interval '1 year',
    least(p_document_expiry, p_issued + interval '3 years');
$$;


ALTER FUNCTION public.set_credential_dates(p_issued date, p_document_expiry date) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: baselines; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.baselines OWNER TO postgres;

--
-- Name: baselines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.baselines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.baselines_id_seq OWNER TO postgres;

--
-- Name: baselines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.baselines_id_seq OWNED BY public.baselines.id;


--
-- Name: credential_events; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.credential_events OWNER TO postgres;

--
-- Name: credential_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credential_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.credential_events_id_seq OWNER TO postgres;

--
-- Name: credential_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credential_events_id_seq OWNED BY public.credential_events.id;


--
-- Name: credential_platforms; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.credential_platforms OWNER TO postgres;

--
-- Name: credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credentials (
    vai character(7) NOT NULL,
    state text DEFAULT 'active'::text NOT NULL,
    complycube_client_id text,
    document_expiry date,
    next_renewal_date date NOT NULL,
    next_complycube_date date,
    screening_state text DEFAULT 'pending'::text NOT NULL,
    screening_note text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    state_changed_at timestamp with time zone DEFAULT now() NOT NULL,
    provisional boolean DEFAULT false NOT NULL,
    CONSTRAINT credentials_screening_state_check CHECK ((screening_state = ANY (ARRAY['pending'::text, 'clear'::text, 'flagged'::text]))),
    CONSTRAINT credentials_state_check CHECK ((state = ANY (ARRAY['active'::text, 'expiring'::text, 'expired'::text, 'awaiting'::text, 'locked'::text, 'suspended'::text, 'banned'::text])))
);


ALTER TABLE public.credentials OWNER TO postgres;

--
-- Name: facial_signature_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facial_signature_attempts (
    id bigint NOT NULL,
    session_id text NOT NULL,
    success boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.facial_signature_attempts OWNER TO postgres;

--
-- Name: facial_signature_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facial_signature_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.facial_signature_attempts_id_seq OWNER TO postgres;

--
-- Name: facial_signature_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facial_signature_attempts_id_seq OWNED BY public.facial_signature_attempts.id;


--
-- Name: facial_verification_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facial_verification_attempts (
    id bigint NOT NULL,
    vai character(7) NOT NULL,
    platform_id text NOT NULL,
    success boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.facial_verification_attempts OWNER TO postgres;

--
-- Name: facial_verification_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facial_verification_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.facial_verification_attempts_id_seq OWNER TO postgres;

--
-- Name: facial_verification_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facial_verification_attempts_id_seq OWNED BY public.facial_verification_attempts.id;


--
-- Name: lookup_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lookup_log (
    id bigint NOT NULL,
    platform_id text NOT NULL,
    vai character(7) NOT NULL,
    found boolean NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lookup_log OWNER TO postgres;

--
-- Name: lookup_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lookup_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lookup_log_id_seq OWNER TO postgres;

--
-- Name: lookup_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lookup_log_id_seq OWNED BY public.lookup_log.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: COLUMN payments.coupon_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.coupon_code IS 'Coupon applied to this payment. NULL if no coupon used.';


--
-- Name: COLUMN payments.discount_cents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.discount_cents IS 'Discount applied in cents. payments.discount_cents + amount_charged = full price.';


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: platform_coupon_redemptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_coupon_redemptions (
    id bigint NOT NULL,
    code text NOT NULL,
    session_id text NOT NULL,
    vai character(7),
    expires_at timestamp with time zone NOT NULL,
    redeemed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.platform_coupon_redemptions OWNER TO postgres;

--
-- Name: TABLE platform_coupon_redemptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.platform_coupon_redemptions IS 'Coupon reservations. Created when coupon applied to session. Expires with session to prevent blocking availability.';


--
-- Name: COLUMN platform_coupon_redemptions.expires_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.platform_coupon_redemptions.expires_at IS 'Copied from session.expires_at. Reservation only counts toward availability if not expired.';


--
-- Name: platform_coupon_redemptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_coupon_redemptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.platform_coupon_redemptions_id_seq OWNER TO postgres;

--
-- Name: platform_coupon_redemptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_coupon_redemptions_id_seq OWNED BY public.platform_coupon_redemptions.id;


--
-- Name: platform_coupons; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.platform_coupons OWNER TO postgres;

--
-- Name: TABLE platform_coupons; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.platform_coupons IS 'Platform-specific discount codes. max_uses is a hard limit - code dies when limit reached.';


--
-- Name: COLUMN platform_coupons.used_count; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.platform_coupons.used_count IS 'Increments ONLY on successful payment (state=paid). Never decrements.';


--
-- Name: platform_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_requirements (
    platform_id text NOT NULL,
    requirement_key text NOT NULL,
    effective_from date NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.platform_requirements OWNER TO postgres;

--
-- Name: platforms; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT platforms_webhook_state_check CHECK ((webhook_state = ANY (ARRAY['active'::text, 'failing'::text, 'disabled'::text])))
);


ALTER TABLE public.platforms OWNER TO postgres;

--
-- Name: COLUMN platforms.base_price_cents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.platforms.base_price_cents IS 'Base price in cents for this platform. Required for percentage-based coupons. NULL if platform uses custom pricing.';


--
-- Name: requirement_completions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirement_completions (
    vai character(7) NOT NULL,
    requirement_key text NOT NULL,
    platform_id text NOT NULL,
    signed_version text NOT NULL,
    signed_at timestamp with time zone DEFAULT now() NOT NULL,
    affirmation_version text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.requirement_completions OWNER TO postgres;

--
-- Name: requirement_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirement_versions (
    requirement_key text NOT NULL,
    version text NOT NULL,
    body text NOT NULL,
    effective_from date NOT NULL
);


ALTER TABLE public.requirement_versions OWNER TO postgres;

--
-- Name: requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requirements (
    key text NOT NULL,
    display_name text NOT NULL,
    kind text NOT NULL,
    ecosystem_wide boolean DEFAULT false NOT NULL,
    CONSTRAINT requirements_kind_check CHECK ((kind = ANY (ARRAY['declaration'::text, 'agreement'::text, 'release'::text, 'check'::text])))
);


ALTER TABLE public.requirements OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT sessions_frame_check CHECK ((frame = ANY (ARRAY['A'::text, 'B'::text]))),
    CONSTRAINT sessions_route_check CHECK ((route = ANY (ARRAY['enrollment'::text, 'rebaseline'::text, 'unlock'::text, 'renewal'::text]))),
    CONSTRAINT sessions_state_check CHECK ((state = ANY (ARRAY['open'::text, 'at_provider'::text, 'processing'::text, 'queued'::text, 'complete'::text, 'failed'::text, 'expired'::text])))
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: baselines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.baselines ALTER COLUMN id SET DEFAULT nextval('public.baselines_id_seq'::regclass);


--
-- Name: credential_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_events ALTER COLUMN id SET DEFAULT nextval('public.credential_events_id_seq'::regclass);


--
-- Name: facial_signature_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_signature_attempts ALTER COLUMN id SET DEFAULT nextval('public.facial_signature_attempts_id_seq'::regclass);


--
-- Name: facial_verification_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_verification_attempts ALTER COLUMN id SET DEFAULT nextval('public.facial_verification_attempts_id_seq'::regclass);


--
-- Name: lookup_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lookup_log ALTER COLUMN id SET DEFAULT nextval('public.lookup_log_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: platform_coupon_redemptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupon_redemptions ALTER COLUMN id SET DEFAULT nextval('public.platform_coupon_redemptions_id_seq'::regclass);


--
-- Name: baselines baselines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.baselines
    ADD CONSTRAINT baselines_pkey PRIMARY KEY (id);


--
-- Name: credential_events credential_events_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_event_id_key UNIQUE (event_id);


--
-- Name: credential_events credential_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_pkey PRIMARY KEY (id);


--
-- Name: credential_platforms credential_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_platforms
    ADD CONSTRAINT credential_platforms_pkey PRIMARY KEY (vai, platform_id);


--
-- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_pkey PRIMARY KEY (vai);


--
-- Name: facial_signature_attempts facial_signature_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_signature_attempts
    ADD CONSTRAINT facial_signature_attempts_pkey PRIMARY KEY (id);


--
-- Name: facial_verification_attempts facial_verification_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_verification_attempts
    ADD CONSTRAINT facial_verification_attempts_pkey PRIMARY KEY (id);


--
-- Name: lookup_log lookup_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lookup_log
    ADD CONSTRAINT lookup_log_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_pkey PRIMARY KEY (id);


--
-- Name: platform_coupons platform_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupons
    ADD CONSTRAINT platform_coupons_pkey PRIMARY KEY (code);


--
-- Name: platform_requirements platform_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_requirements
    ADD CONSTRAINT platform_requirements_pkey PRIMARY KEY (platform_id, requirement_key);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (id);


--
-- Name: requirement_completions requirement_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_pkey PRIMARY KEY (vai, requirement_key, platform_id);


--
-- Name: requirement_versions requirement_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_versions
    ADD CONSTRAINT requirement_versions_pkey PRIMARY KEY (requirement_key, version);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (key);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: baselines_vai_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX baselines_vai_created_at_idx ON public.baselines USING btree (vai, created_at DESC);


--
-- Name: credential_events_emission_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX credential_events_emission_id_idx ON public.credential_events USING btree (emission_id);


--
-- Name: credential_events_platform_id_delivered_at_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX credential_events_platform_id_delivered_at_created_at_idx ON public.credential_events USING btree (platform_id, delivered_at NULLS FIRST, created_at);


--
-- Name: facial_signature_attempts_session_id_attempted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX facial_signature_attempts_session_id_attempted_at_idx ON public.facial_signature_attempts USING btree (session_id, attempted_at DESC);


--
-- Name: facial_verification_attempts_vai_platform_id_attempted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX facial_verification_attempts_vai_platform_id_attempted_at_idx ON public.facial_verification_attempts USING btree (vai, platform_id, attempted_at DESC);


--
-- Name: payments_coupon_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_coupon_code_idx ON public.payments USING btree (coupon_code) WHERE (coupon_code IS NOT NULL);


--
-- Name: payments_vai_period_end_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_vai_period_end_idx ON public.payments USING btree (vai, period_end DESC);


--
-- Name: platform_coupon_redemptions_code_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX platform_coupon_redemptions_code_expires_at_idx ON public.platform_coupon_redemptions USING btree (code, expires_at);


--
-- Name: platform_coupon_redemptions_session_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX platform_coupon_redemptions_session_id_idx ON public.platform_coupon_redemptions USING btree (session_id);


--
-- Name: platform_coupon_redemptions_vai_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX platform_coupon_redemptions_vai_idx ON public.platform_coupon_redemptions USING btree (vai) WHERE (vai IS NOT NULL);


--
-- Name: platform_coupons_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX platform_coupons_expires_at_idx ON public.platform_coupons USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: platform_coupons_platform_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX platform_coupons_platform_id_idx ON public.platform_coupons USING btree (platform_id);


--
-- Name: payments payment_increments_coupon_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER payment_increments_coupon_count AFTER INSERT OR UPDATE OF state ON public.payments FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_used_count();


--
-- Name: baselines baselines_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.baselines
    ADD CONSTRAINT baselines_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: credential_events credential_events_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: credential_events credential_events_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_events
    ADD CONSTRAINT credential_events_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: credential_platforms credential_platforms_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_platforms
    ADD CONSTRAINT credential_platforms_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: credential_platforms credential_platforms_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_platforms
    ADD CONSTRAINT credential_platforms_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: facial_signature_attempts facial_signature_attempts_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_signature_attempts
    ADD CONSTRAINT facial_signature_attempts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: facial_verification_attempts facial_verification_attempts_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_verification_attempts
    ADD CONSTRAINT facial_verification_attempts_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: facial_verification_attempts facial_verification_attempts_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facial_verification_attempts
    ADD CONSTRAINT facial_verification_attempts_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: lookup_log lookup_log_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lookup_log
    ADD CONSTRAINT lookup_log_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: payments payments_coupon_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_coupon_code_fkey FOREIGN KEY (coupon_code) REFERENCES public.platform_coupons(code);


--
-- Name: payments payments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: payments payments_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_code_fkey FOREIGN KEY (code) REFERENCES public.platform_coupons(code);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: platform_coupon_redemptions platform_coupon_redemptions_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupon_redemptions
    ADD CONSTRAINT platform_coupon_redemptions_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: platform_coupons platform_coupons_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_coupons
    ADD CONSTRAINT platform_coupons_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_requirements platform_requirements_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_requirements
    ADD CONSTRAINT platform_requirements_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_requirements platform_requirements_requirement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_requirements
    ADD CONSTRAINT platform_requirements_requirement_key_fkey FOREIGN KEY (requirement_key) REFERENCES public.requirements(key);


--
-- Name: requirement_completions requirement_completions_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: requirement_completions requirement_completions_requirement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_requirement_key_fkey FOREIGN KEY (requirement_key) REFERENCES public.requirements(key);


--
-- Name: requirement_completions requirement_completions_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_completions
    ADD CONSTRAINT requirement_completions_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: requirement_versions requirement_versions_requirement_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requirement_versions
    ADD CONSTRAINT requirement_versions_requirement_key_fkey FOREIGN KEY (requirement_key) REFERENCES public.requirements(key);


--
-- Name: sessions sessions_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: sessions sessions_vai_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_vai_fkey FOREIGN KEY (vai) REFERENCES public.credentials(vai);


--
-- Name: platform_coupons Service role manages coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role manages coupons" ON public.platform_coupons TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_coupon_redemptions Service role manages redemptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role manages redemptions" ON public.platform_coupon_redemptions TO service_role USING (true) WITH CHECK (true);


--
-- Name: platform_coupon_redemptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_coupon_redemptions ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_coupons; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION calculate_cosine_similarity(baseline_vector public.vector, capture_vector text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_cosine_similarity(baseline_vector public.vector, capture_vector text) TO anon;
GRANT ALL ON FUNCTION public.calculate_cosine_similarity(baseline_vector public.vector, capture_vector text) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_cosine_similarity(baseline_vector public.vector, capture_vector text) TO service_role;


--
-- Name: FUNCTION increment_coupon_used_count(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_coupon_used_count() TO anon;
GRANT ALL ON FUNCTION public.increment_coupon_used_count() TO authenticated;
GRANT ALL ON FUNCTION public.increment_coupon_used_count() TO service_role;


--
-- Name: FUNCTION set_credential_dates(p_issued date, p_document_expiry date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_credential_dates(p_issued date, p_document_expiry date) TO anon;
GRANT ALL ON FUNCTION public.set_credential_dates(p_issued date, p_document_expiry date) TO authenticated;
GRANT ALL ON FUNCTION public.set_credential_dates(p_issued date, p_document_expiry date) TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE baselines; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.baselines TO anon;
GRANT ALL ON TABLE public.baselines TO authenticated;
GRANT ALL ON TABLE public.baselines TO service_role;


--
-- Name: SEQUENCE baselines_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.baselines_id_seq TO anon;
GRANT ALL ON SEQUENCE public.baselines_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.baselines_id_seq TO service_role;


--
-- Name: TABLE credential_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credential_events TO anon;
GRANT ALL ON TABLE public.credential_events TO authenticated;
GRANT ALL ON TABLE public.credential_events TO service_role;


--
-- Name: SEQUENCE credential_events_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.credential_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.credential_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.credential_events_id_seq TO service_role;


--
-- Name: TABLE credential_platforms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credential_platforms TO anon;
GRANT ALL ON TABLE public.credential_platforms TO authenticated;
GRANT ALL ON TABLE public.credential_platforms TO service_role;


--
-- Name: TABLE credentials; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.credentials TO anon;
GRANT ALL ON TABLE public.credentials TO authenticated;
GRANT ALL ON TABLE public.credentials TO service_role;


--
-- Name: TABLE facial_signature_attempts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.facial_signature_attempts TO anon;
GRANT ALL ON TABLE public.facial_signature_attempts TO authenticated;
GRANT ALL ON TABLE public.facial_signature_attempts TO service_role;


--
-- Name: SEQUENCE facial_signature_attempts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.facial_signature_attempts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.facial_signature_attempts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.facial_signature_attempts_id_seq TO service_role;


--
-- Name: TABLE facial_verification_attempts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.facial_verification_attempts TO anon;
GRANT ALL ON TABLE public.facial_verification_attempts TO authenticated;
GRANT ALL ON TABLE public.facial_verification_attempts TO service_role;


--
-- Name: SEQUENCE facial_verification_attempts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.facial_verification_attempts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.facial_verification_attempts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.facial_verification_attempts_id_seq TO service_role;


--
-- Name: TABLE lookup_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.lookup_log TO anon;
GRANT ALL ON TABLE public.lookup_log TO authenticated;
GRANT ALL ON TABLE public.lookup_log TO service_role;


--
-- Name: SEQUENCE lookup_log_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.lookup_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.lookup_log_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.lookup_log_id_seq TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: SEQUENCE payments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO service_role;


--
-- Name: TABLE platform_coupon_redemptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_coupon_redemptions TO anon;
GRANT ALL ON TABLE public.platform_coupon_redemptions TO authenticated;
GRANT ALL ON TABLE public.platform_coupon_redemptions TO service_role;


--
-- Name: SEQUENCE platform_coupon_redemptions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.platform_coupon_redemptions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.platform_coupon_redemptions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.platform_coupon_redemptions_id_seq TO service_role;


--
-- Name: TABLE platform_coupons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_coupons TO anon;
GRANT ALL ON TABLE public.platform_coupons TO authenticated;
GRANT ALL ON TABLE public.platform_coupons TO service_role;


--
-- Name: TABLE platform_requirements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_requirements TO anon;
GRANT ALL ON TABLE public.platform_requirements TO authenticated;
GRANT ALL ON TABLE public.platform_requirements TO service_role;


--
-- Name: TABLE platforms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platforms TO anon;
GRANT ALL ON TABLE public.platforms TO authenticated;
GRANT ALL ON TABLE public.platforms TO service_role;


--
-- Name: TABLE requirement_completions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.requirement_completions TO anon;
GRANT ALL ON TABLE public.requirement_completions TO authenticated;
GRANT ALL ON TABLE public.requirement_completions TO service_role;


--
-- Name: TABLE requirement_versions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.requirement_versions TO anon;
GRANT ALL ON TABLE public.requirement_versions TO authenticated;
GRANT ALL ON TABLE public.requirement_versions TO service_role;


--
-- Name: TABLE requirements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.requirements TO anon;
GRANT ALL ON TABLE public.requirements TO authenticated;
GRANT ALL ON TABLE public.requirements TO service_role;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sessions TO anon;
GRANT ALL ON TABLE public.sessions TO authenticated;
GRANT ALL ON TABLE public.sessions TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- PostgreSQL database dump complete
--

