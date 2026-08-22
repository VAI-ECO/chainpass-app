-- BLOCKER-ENROLMENT-TERMS (22 Aug 2026) §7 — the one legitimate unblock, owner-approved.
-- A DRAFT terms version, marked as a draft, so the build can be tested end to end.
-- The body is a marker, not shortened real terms. It must be replaced by the real
-- document (owner · counsel) before any real member enrols. Replacement is a launch gate.
--
-- agreement_versions is immutable (20260821000013) — INSERT only, never UPDATE/DELETE.

BEGIN;

INSERT INTO public.agreement_versions (
  platform_id,
  subtype,
  body,
  notice,
  version,
  effective_from
) VALUES (
  'vairify',
  'terms',
  $draft$⚠️⚠️ UNPUBLISHED DRAFT — NOT A LEGAL AGREEMENT. DO NOT PRESENT TO A MEMBER AS TERMS. ⚠️⚠️

This row exists only so the enrolment build can be tested end to end
(BLOCKER-ENROLMENT-TERMS, 22 August 2026, §7 — owner-approved draft unblock).

This is NOT ChainPass's minimum standard terms. This is NOT Vairify's terms.
It contains no clauses, grants no rights, and creates no obligations.
No member may be asked to accept this document.

The real terms must be written by the owner and counsel and inserted as a new
agreement_versions row. Replacing this draft is a gate on launch, recorded as such.⚠️⚠️ UNPUBLISHED DRAFT — NOT A LEGAL AGREEMENT. ⚠️⚠️$draft$,
  'UNPUBLISHED DRAFT — not a legal agreement. Test marker only. Replace before launch (BLOCKER-ENROLMENT-TERMS §7).',
  '0-DRAFT',
  '2026-08-01T00:00:00+00'
);

INSERT INTO public.platform_agreements (
  platform_id,
  required_credential_level,
  deferral_offered,
  collection_fields,
  terms_doc_ref,
  terms_version
)
SELECT
  'vairify',
  3,        -- §1.1a · §14.1 — Vairify requires Pro; Pro is level 3. Never NULL (enrol-pay reads NULL as 1).
  true,     -- §4A.2 item 2 — Vairify offers deferral; window hours live at settings:deferral_window_hours.
  '{"required":["username"],"groups":[{"at_least_one_of":["email","phone"]}]}'::jsonb, -- §2.3 · §2.9 — never legal name.
  av.id::text,
  av.version
FROM public.agreement_versions av
WHERE av.platform_id = 'vairify'
  AND av.subtype = 'terms'
  AND av.version = '0-DRAFT';
-- commission_rules, payment_method, consumption_block_size, settlement_schedule,
-- signed_at, deferral_window_hours left at schema defaults / NULL — no ruled values (§4 of the blocker).

COMMIT;

-- Verify
SELECT id, platform_id, subtype, version, effective_from, left(body, 80) AS body_head, notice
FROM public.agreement_versions
WHERE platform_id = 'vairify' AND subtype = 'terms';

SELECT id, platform_id, required_credential_level, deferral_offered, deferral_window_hours,
       collection_fields, terms_doc_ref, terms_version, commission_rules,
       payment_method, consumption_block_size, settlement_schedule, signed_at, version
FROM public.platform_agreements
WHERE platform_id = 'vairify';
