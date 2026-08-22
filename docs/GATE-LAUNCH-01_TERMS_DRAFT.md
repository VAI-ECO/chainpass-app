# GATE-LAUNCH-01 — TERMS DRAFT MUST BE REPLACED BEFORE LAUNCH

**22 August 2026. Recorded in three places: this file · `OPERATIONS.md` · `CANON-CP-01`
changelog item 21.**

---

# 0 — THE ONE SENTENCE

⚠️⚠️ **NO REAL MEMBER MAY ENROL UNTIL THE `0-DRAFT` TERMS ROW IS REPLACED BY REAL LEGAL
TEXT WRITTEN BY THE OWNER AND COUNSEL.**

---

# 1 — WHAT IS LIVE TODAY

| Table | Row | Purpose |
|---|---|---|
| `agreement_versions` | `id = 1bdc9e8a-4981-4d0a-bb85-09528b2f2553` · `platform_id = 'vairify'` · `subtype = 'terms'` · `version = '0-DRAFT'` · `effective_from = 2026-08-01` | Draft marker only — body opens **"⚠️⚠️ UNPUBLISHED DRAFT — NOT A LEGAL AGREEMENT."** |
| `platform_agreements` | `id = 1` · `platform_id = 'vairify'` · `terms_doc_ref` → draft uuid · `terms_version = '0-DRAFT'` | Points at the draft so `enrol-pay` can quote for build testing |

**Hosted instance:** `pguwhjearlqqfworantq` (ChainPass production, West US Oregon).

**Seed file:** `supabase/seeds/20260822_vairify_terms_draft.sql`.

**Why it exists:** Owner approved the §7 draft unblock (`BLOCKER-ENROLMENT-TERMS__2026-08-22.md`)
so the enrolment build can be tested end to end. It is not a shortened version of real terms.
It is a visibly marked placeholder.

---

# 2 — WHAT REPLACES IT

| # | Step | Who |
|---|---|---|
| 1 | ⚠️⚠️ **THE REAL LEGAL TEXT IS WRITTEN** — either ChainPass's minimum standard terms (§14.3
item 1) or Vairify's own terms uploaded at onboarding (§14.2b item 2) | ⚠️⚠️ **OWNER ·
COUNSEL. NOT AN AGENT.** |
| 2 | A **new** `agreement_versions` row is inserted — `platform_id`, `subtype = 'terms'`,
non-empty `body`, ruled `version`, `effective_from`. Versions are **immutable**; the draft
row is never edited or deleted | Build |
| 3 | `platform_agreements.terms_doc_ref` and `terms_version` are updated to point at the new
row | Build |
| 4 | ⚠️ **Every surface that displays terms must show the real document, not `0-DRAFT`** |
Build + design |
| 5 | ⚠️⚠️ **THIS GATE IS CLOSED AND RECORDED BEFORE ANY REAL MEMBER ENROLS** | Owner |

---

# 3 — WHO WRITES IT

| Role | Responsibility |
|---|---|
| ⚠️⚠️ **Owner** | Decides whether ChainPass minimum standard terms or platform-specific terms
apply; approves the text |
| ⚠️⚠️ **Counsel** | Writes the legal clauses — data custody, acceptance, platform-branded
surface disclosure (§14.2b–c, owner ruling 22 Aug on register-step terms) |
| Build | Inserts the ruled row, updates `platform_agreements`, verifies display and acceptance
record |
| ⚠️ **Agents** | ⚠️⚠️ **DO NOT DRAFT THE TERMS.** Legal text on a platform serving people at
physical risk is not a generated artifact |

---

# 4 — WHAT NO ONE MAY DO

| # | |
|---|---|
| 1 | ⚠️⚠️ **Present `0-DRAFT` to a real member as terms she accepts** |
| 2 | ⚠️⚠️ **Make `terms_doc_ref` or `terms_version` NULLABLE to bypass the gate** |
| 3 | ⚠️ **Treat the COALESCE label `'minimum standard terms'` as resolving to a document** |
| 4 | ⚠️ **Edit or delete the draft row after any acceptance record exists** — versions are
immutable |

---

# 5 — RELATED DOCUMENTS

| File | Role |
|---|---|
| `docs/BLOCKER-ENROLMENT-TERMS__2026-08-22.md` | Original blocker analysis and §7 draft
unblock decision |
| `docs/canon/CANON-CP-01` §14.2–§14.3 | Terms versioning, platform agreement API |
| `docs/canon/RULINGS-CP-02__2026-08-22_.md` | Owner rulings folded into canon 22 Aug |
| `docs/canon/OPERATIONS.md` §11 | Flagged row — this gate |

---

**Filed 22 August 2026. Gate open until owner closes it with real terms.**
