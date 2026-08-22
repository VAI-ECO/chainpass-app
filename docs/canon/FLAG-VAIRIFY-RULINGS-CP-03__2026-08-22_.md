# FLAG — VAIRIFY CANON vs RULINGS-CP-03 §7 (RECOVERY CUSTODY)

**Repo:** `vairify-app` · **do not edit from `chainpass-app`.** This file records contradictions
only. Correct at source in vairify-app when custody migration lands.

⚠️⚠️ **RULING:** `security_questions` · `security_question_lockouts` ·
`security_question_attempts` · `security_question_options` · `recovery_codes` are **ChainPass's**.
Collected at enrolment step 12. Vairify reads lockout state; it does not own the rows.

---

## CANON-MI-25 — sections that contradict ruling 7

| Section | Contradiction |
|---|---|
| **§2.1 item 1** | **"Three, chosen by her, at registration."** Registration/setup is ChainPass step 12, not Vairify registration. |
| **§1.1 item 5** | **"Shown once at onboarding."** Onboarding in MI-25/MI-33 means Vairify's first screen; ruling 7 places issuance at ChainPass account security. |
| **§3 items 1–3** | **Lockout enforcement "in the database" with RLP and CHECK on `cleared_by`.** Schema and constraint must live on ChainPass; Vairify canon still describes Vairify as custodian. |
| **§4 (whole block)** | **"VAIRIFY SETS A PENDING STATE"** on `security_question_lockouts`. Pending/cleared rows are ChainPass's; Vairify should set pending via ChainPass API or read ChainPass state, not own the table. |
| **§4.2** | **Pending survives browser/cache/device — server-side.** True behaviour, wrong database owner in current Vairify migrations and wire docs. |
| **§5** | **Optional question reset after re-verification.** Writes to `security_questions` — must target ChainPass, not Vairify. |
| **§7** | **"One recovery route"** assumes Vairify-local question/code redemption against local tables. |

⚠️ **Sections that still align after custody move:** §4.1 four states · §4.3 window as plain date ·
§6 what Vairify is never told · §3.1 why admin cannot unlock (behaviour unchanged; location moves).

---

## CANON-MI-33 — sections that contradict ruling 7

| Section | Contradiction |
|---|---|
| **§0** | **"First screen of Vairify onboarding"** with three recovery sections. Ruling 7 and `CANON-CP-01` §2.10 place this at ChainPass step 12, before handoff. |
| **§1** | **"Recovery must exist before there is anything to recover" at the Vairify door.** Custody and setup are ChainPass's; Vairify receives an already-configured holder. |
| **§2.1–§2.2 (copy)** | **"Nobody at Vairify can read them" / stored scrambled.** Rows live on ChainPass; copy is directionally right but implies Vairify storage. |
| **§4 item 1** | **"VAIRIFY CANNOT READ THEM. THE COPY SAYS SO AND THE COPY MUST BE TRUE."** Must become ChainPass custodian language if screens stay Vairify-branded, or screens move to ChainPass. |
| **§4 item 2** | **One-time passwords shown once, stored hashed.** Table is `recovery_codes` on ChainPass per ruling 7. |
| **§5** | **Relation to `CANON-MI-25`.** Assumes MI-33 is enrolment-time at Vairify; contradicts `RULINGS-CP-02` §4 and `RULINGS-CP-03` §7. |

---

## Vairify schema and code that must follow (report only)

**Drop from Vairify** (after ChainPass migration applied and callers repointed):

- `public.security_questions`
- `public.security_question_lockouts`
- `public.security_question_attempts`
- `public.security_question_options`
- `public.recovery_codes`

**Reads/writes today (Vairify repo):**

| Location | Tables |
|---|---|
| `supabase/migrations/20260816000000_vairify_schema.sql` | Creates all five |
| `supabase/migrations/20260822000002_lockouts_cleared_by_chainpass_only.sql` | `security_question_lockouts` constraint |
| `supabase/migrations/20260822000003_phase0_schema_reds.sql` | `recovery_codes` |
| `supabase/functions/start-reverification/index.ts` | `security_question_lockouts` |
| `supabase/functions/verify-security-question/index.ts` | lockouts, attempts, `user_security_questions` |
| `supabase/functions/chainpass-unlock-security/index.ts` | lockouts, `user_security_questions` |
| `supabase/functions/setup-security-questions/index.ts` | `user_security_questions`, lockouts |
| `supabase/functions/update-security-questions/index.ts` | `user_security_questions` |
| `src/pages/onboarding/SecurityQuestionsSetup.tsx` | `security_question_options` |
| `src/pages/onboarding/RegistrationCanon.tsx` | `security_question_options` |
| `src/pages/AuthRecoveryCanon.tsx` | `recovery_codes`, `security_question_lockouts` |
| `src/pages/ReverificationPending.tsx` | `security_question_lockouts` |
| `src/pages/settings/SecurityQuestions.tsx` | `user_security_questions`, `security_question_options` |
| Wire docs: `MI-25-WIRE`, `MI-22-WIRE`, `CANON-MI-33-WIRE`, `CANON-MI-24-WIRE`, `SCREEN-REGISTER-VAIRIFY` | Assert Vairify custody |

⚠️ **Note:** Live Vairify schema also uses legacy name `user_security_questions` in some edge
functions while migrations define `security_questions` — reconcile during repoint, not here.

---

**22 August 2026.**
