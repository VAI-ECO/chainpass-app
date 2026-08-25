# BLOCKER — CHAINPASS ENROLMENT CANNOT START

**22 August 2026. Verified against the live hosted database, not inferred.**

---

# 0 — THE ONE SENTENCE

⚠️⚠️ **NO MEMBER CAN ENROL ON ANY PLATFORM, BECAUSE THE TERMS DOCUMENT SHE WOULD ACCEPT DOES
NOT EXIST — NOT IN CANON, NOT IN THE REPOSITORY, NOT IN THE DATABASE.**

---

# 1 — WHERE IT STOPS

Enrolment is coded and deployed. Steps SN-01 through SN-15 are live on hosted Supabase
`pguwhjearlqqfworantq`. 28 tests pass. The chain resolves.

It stops at the **pay** step, and the reason is upstream of payment.

```
enrol → keep → consent → PAY ← stops here
```

`enrol-pay` cannot quote, because quoting reads the platform agreement, and no platform
agreement row can exist.

---

# 2 — THE EXACT CHAIN

| # | Fact | Verified how |
|---|---|---|
| 1 | `platforms` has one row — `vairify`, `service_level 3`, `status active` | Seeded 22 Aug, live |
| 2 | `platform_agreements` has **zero rows** | Live query |
| 3 | `platform_agreements.terms_doc_ref` is **NOT NULL** | Migration `20260821000014` |
| 4 | `platform_agreements.terms_version` is **NOT NULL** | Migration `20260821000014` |
| 5 | Canon **§14.3** — no terms, no agreement, no API key | `CANON-CP-01` |
| 6 | The terms **body** lives on `agreement_versions`, `subtype = 'terms'` | Canon §14.2 |
| 7 | `agreement_versions` has **zero rows**. Every `body` is empty | Live query |
| 8 | Canon **§14.3 item 1** — a platform with no terms of its own takes ChainPass's minimum standard terms as the default | `CANON-CP-01` |
| 9 | ⚠️⚠️ **THOSE MINIMUM STANDARD TERMS HAVE NEVER BEEN WRITTEN** | Searched canon, both repos, the live database |

⚠️⚠️ **CANON NAMES THE DOCUMENT. NOBODY EVER WROTE IT.**

The only trace anywhere is the string `'minimum standard terms'`, written by migration
`20260821000014` as a COALESCE default into `terms_doc_ref`. **That is a label pointing at a
document that does not exist.** Not a body. Not clauses. Not a version. Not an effective
date.

---

# 3 — WHY IT IS WORSE THAN IT LOOKS

**A ruling made today moved this document earlier in the flow.**

⚠️⚠️ **TERMS ACCEPTANCE IS ADMINISTERED BY CHAINPASS ON THE ACCEPTANCE PAGE — STEP 8 —
WITH THE SECOND CAPTURE. SUPERSEDES THE REGISTER-STEP PLACEMENT. APPLIES TO EVERY MEMBER
ON EVERY PLATFORM — `RULINGS-CP-03` §1.**

> ⚠️⚠️ **"CHAINPASS IS THE GATEKEEPER MAKING SURE EVERYONE IS COMPLIANT. THAT WOULD BE ITS
> JOB."** — owner, 22 August

**Consequences:**

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE TERMS ARE NO LONGER A PAY-STEP OR REGISTER-STEP CONCERN. THEY ARE AN ACCEPTANCE-PAGE CONCERN — WITH THE SECOND CAPTURE.** |
| 2 | ⚠️ **The platform supplies the text. ChainPass displays it, collects the acceptance and holds the record.** Compliance is ChainPass's function, not the platform's. |
| 3 | ⚠️ **The surface may be platform-branded or co-branded.** The custody is ChainPass's regardless of whose logo is on the page. |
| 4 | ⚠️⚠️ **WHATEVER SHE IS TOLD ABOUT WHO HOLDS HER DATA MUST BE TRUE. A PAGE THAT LOOKS ENTIRELY LIKE THE PLATFORM WHILE CHAINPASS STORES THE RECORD MUST DISCLOSE THAT. THAT IS THE AUDIT PROTECTION — NOT THE LOGO.** |

---

# 4 — WHAT EXISTS AND WHAT DOES NOT

## Ruled and fillable today

| Field | Value | Canon |
|---|---|---|
| `platform_id` | `vairify` | §1.1a |
| `required_credential_level` | **3** — Vairify requires Pro; Pro is level 3 | §1.1a · §14.1 |
| `deferral_offered` | **true** — "Vairify's window is `settings:deferral_window`" | §4A.2 item 2 |
| `collection_fields` | username mandatory · at least one of email or phone · **never a legal name** | §2.3 · §2.9 |

⚠️ **`required_credential_level` MUST NOT BE LEFT NULL — `enrol-pay` treats NULL as level 1
and would quote the wrong credential.**

## ⬜ UNRULED — blocks the row

| Field | Why |
|---|---|
| ⚠️⚠️ **`terms_doc_ref`** | **NOT NULL. No document exists to point at.** |
| ⚠️⚠️ **`terms_version`** | **NOT NULL. No version string is ruled.** |
| `commission_rules` | Rates are admin-adjustable; no figure is ruled. `{}` is a schema default, not a tariff |
| `payment_method` | Trolley recipient reference. No value |
| `consumption_block_size` | A priced figure. No number ruled |
| `settlement_schedule` | No schedule ruled |
| `signed_at` | The platform agreement has not been signed |
| `version` | Default `'1'` is schema, not a ruled agreement version |
| `deferral_window_hours` | ⚠️ **Leave NULL — the hours live at `settings:deferral_window`. Putting a number here invents a figure and breaks `CANON-00` §16.** |

---

# 5 — WHAT HAS TO HAPPEN, IN ORDER

| # | Step | Who |
|---|---|---|
| 1 | ⚠️⚠️ **THE LEGAL TEXT IS WRITTEN.** Either ChainPass's minimum standard terms (§14.3 item 1) or Vairify's own, uploaded at onboarding (§14.2b item 2). **Neither exists.** | ⚠️⚠️ **OWNER · COUNSEL. NOT AN AGENT.** |
| 2 | That body becomes the unique current `agreement_versions` row — `platform_id`, `subtype = 'terms'`, non-empty `body`, `version`, `effective_from` | Build |
| 3 | `platform_agreements` row is inserted with `terms_doc_ref` and `terms_version` pointing at it, plus the four ruled fields in §4 | Build |
| 4 | `enrol-pay` can quote. Enrolment runs end to end | Build |

---

# 6 — ⚠️⚠️ WHAT NO AGENT MAY DO

| # | |
|---|---|
| 1 | ⚠️⚠️ **DO NOT DRAFT THE TERMS.** Legal text on a platform serving people at physical risk is not a generated artifact. **An agent-written terms document that a real member accepts is a liability, not a placeholder.** |
| 2 | ⚠️⚠️ **DO NOT MAKE `terms_doc_ref` OR `terms_version` NULLABLE TO UNBLOCK THE BUILD.** §14.3 exists precisely to stop a platform operating without terms. Relaxing the constraint deletes the rule. |
| 3 | ⚠️ **DO NOT COPY THE COALESCE LABEL `'minimum standard terms'` FORWARD AS THOUGH IT RESOLVES TO SOMETHING.** It points at nothing. |
| 4 | ⚠️ **DO NOT INVENT A FIGURE FOR ANY UNRULED FIELD IN §4.** A schema default is not a ruling. |

---

# 7 — THE ONE LEGITIMATE UNBLOCK

⚠️ **A DRAFT VERSION, MARKED AS A DRAFT, SO THE BUILD CAN BE TESTED END TO END.**

| # | |
|---|---|
| 1 | `agreement_versions` row with `version = '0-DRAFT'` and `effective_from` in the past |
| 2 | ⚠️⚠️ **THE BODY SAYS, IN ITS FIRST LINE, THAT IT IS AN UNPUBLISHED DRAFT AND NOT A LEGAL AGREEMENT.** It is not a shortened version of real terms. It is a marker |
| 3 | ⚠️⚠️ **IT IS REPLACED BEFORE ANY REAL MEMBER ENROLS. THE REPLACEMENT IS A GATE ON LAUNCH, RECORDED AS SUCH.** |
| 4 | ⚠️ **The draft must be visibly impossible to mistake for the real document** — in the database, on the screen, and in any export |

⚠️⚠️ **THIS IS AN OWNER DECISION. IT HAS NOT BEEN MADE.**

---

# 7A — ✅ RESOLUTION — EXECUTED 22 AUGUST 2026

**Owner approved the draft unblock ("insert it", 22 Aug). Both rows are live on
`pguwhjearlqqfworantq`, verified by live select.**

| Row | Value |
|---|---|
| `agreement_versions` | `id = 1bdc9e8a-4981-4d0a-bb85-09528b2f2553` · `platform_id = 'vairify'` · `subtype = 'terms'` · `version = '0-DRAFT'` · `effective_from = 2026-08-01` · body opens **"⚠️⚠️ UNPUBLISHED DRAFT — NOT A LEGAL AGREEMENT."** |
| `platform_agreements` | `id = 1` · `platform_id = 'vairify'` · `required_credential_level = 3` · `deferral_offered = true` · `deferral_window_hours = NULL` (hours at `settings:deferral_window_hours`) · `collection_fields = {"required":["username"],"groups":[{"at_least_one_of":["email","phone"]}]}` · `terms_doc_ref` → the draft row id · `terms_version = '0-DRAFT'` · `commission_rules {}` · `payment_method`, `consumption_block_size`, `settlement_schedule`, `signed_at` all NULL |

Seed file: `supabase/seeds/20260822_vairify_terms_draft.sql`.

⚠️⚠️ **STANDING GATE ON LAUNCH: recorded in `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` ·
`OPERATIONS.md` §11 · `CANON-CP-01` changelog item 21.**

---

# 8 — QUESTIONS FOR WHOEVER TAKES THIS

| # | |
|---|---|
| 1 | Does ChainPass write minimum standard terms once, for every platform, or does each platform supply its own with no default? §14.3 item 1 says a default exists. **It does not.** |
| 2 | Terms acceptance is on the acceptance page and applies to everyone. **Does a member who enrols with no platform behind her accept ChainPass's own terms?** There is no ruling. |
| 3 | Where does the acceptance record live? `agreement_proofs` holds a face-pass row per version. **The second capture on the acceptance page is the face pass. The checkbox gates that capture.** |
| 4 | The platform brands the surface and ChainPass holds the data. **What exactly must the page disclose, and in whose words?** |

---

**Filed 22 August 2026. Every fact above is a live query, a migration line or a canon
section. Nothing is inferred.**
