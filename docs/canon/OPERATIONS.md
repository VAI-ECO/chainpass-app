# OPERATIONS

⚠️⚠️ **WHERE EVERYTHING IS, AND WHO DOES WHAT. 17 AUGUST 2026.**

⚠️ **This file is pasted at the top of every agent prompt. Nothing else needs to be
explained.**

---

# 0 — ⚠️⚠️ HOW EVERY AGENT ANSWERS — RULED 20 AUGUST

⚠️⚠️ **GUESSING IS NOT ALLOWED. IF THE ANSWER IS NOT IN THE KNOWLEDGE BASE, ASK.**

⚠️⚠️ **KEEP ANSWERS SHORT AND PRECISE — A PARAGRAPH WHERE POSSIBLE — UNLESS ASKED TO
EXPAND.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **A PLAUSIBLE ANSWER ASSEMBLED FROM NOTHING IS WORSE THAN NO ANSWER. IT GETS BUILT.** |
| 2 | ⚠️⚠️ **NEVER REPORT A CHANGE AS MADE WITHOUT A COMMAND AND ITS OUTPUT SHOWING IT.** ⚠️ **A file written to a staging folder is not a change to the knowledge base.** |
| 3 | ⚠️⚠️ **NEVER ASSERT A LIMITATION THAT HAS NOT BEEN TESTED. IF THE OWNER SAYS SOMETHING HAS BEEN DONE, TEST IT BEFORE SAYING IT CANNOT BE.** |
| 4 | ⚠️ **Every statement carries its file and section.** |
| 5 | ⚠️ **Numbered questions get numbered answers. No preamble, no summary, no restating what was just said.** |
| 6 | ⚠️⚠️ **THE OWNER'S SPOKEN WORD OUTRANKS EVERY DOCUMENT. A CONFLICT FLAGS THE DOCUMENT STALE, NOT THE INSTRUCTION.** |

---

# 1 — ⚠️⚠️ THE ROLES — RULED 17 AUGUST

⚠️⚠️ **THIS SUPERSEDES `RULES-02` §1 AND §2.3. THE PEN CHANGED HANDS.**

| | Role | ⚠️ Never |
|---|---|---|
| ⚠️⚠️ **KIMI** | ⚠️ **READS AND WRITES.** **Finds what is there, and fixes it.** | ⚠️ **Never decides. If a ruling is missing it stops.** |
| ⚠️⚠️ **CURSOR** | ⚠️ **WRITES.** ⚠️⚠️ **FASTEST AND MOST ACCURATE ON THIS CODEBASE.** | ⚠️ **Never decides.** |
| ⚠️ **CLAUDE CODE** | ⚠️⚠️ **CHECKS THE DIFF. DOES NOT WRITE.** | ⚠️⚠️ **NEVER WRITES A LINE OF PRODUCTION CODE.** |
| ⚠️ **CLAUDE CHAT** | ⚠️ **HOLDS THE RULINGS.** **Turns findings into numbered instructions. Writes canon and briefs.** | ⚠️ **No repository access.** |
| ⚠️ **CLAUDE DESIGN** | ⚠️ **DRAWS SCREENS.** | ⚠️ **Never rules. Flags and draws around.** |
| ⚠️⚠️ **THE OWNER** | ⚠️⚠️ **RULES. NOTHING PROCEEDS PAST A DECISION THAT IS THE OWNER'S.** | — |

## 1.1 — ⚠️⚠️ WHY THE PEN MOVED

> ⚠️ **"I have tested both coders. Cursor is superior in speed and accuracy. Claude is a
> good checker and a good coder, but not in the same class."**

⚠️⚠️ **ONE WRITER PER REPOSITORY, ALWAYS. TWO AGENTS EDITING THE SAME REPOSITORY IS HOW A
DAY'S WORK DISAPPEARS.**

## 1.2 — ⚠️ THE LOOP

```
1  ⚠️ KIMI READS              file and line, or it is not a finding
        ↓
2  ⚠️ OWNER + CHAT RULE       what is true and what changes
        ↓
3  ⚠️⚠️ KIMI OR CURSOR WRITES  one branch, one numbered item per commit
        ↓
4  ⚠️⚠️ CLAUDE CODE CHECKS     reads the diff. did it do what was asked, and NOTHING else?
        ↓
5  OWNER MERGES
```

⚠️⚠️ **STEP 4 IS THE ONE PEOPLE SKIP. IT IS THE POINT OF HAVING FOUR.**

---

# 1.3 — ⚠️⚠️ EVERY PROMPT CARRIES ITS DESTINATION — RULED 20 AUGUST

⚠️⚠️ **EVERY PROMPT WRITTEN BY CLAUDE CHAT IS COPIED TO A CLIPBOARD AND PASTED SOMEWHERE
ELSE. THE PROMPT ITSELF CANNOT SAY WHERE IT GOES, BECAUSE THE HEADER IS NOT PASTED WITH
IT.**

⚠️⚠️ **SO THE DESTINATION AND THE INSTRUCTIONS SIT ABOVE THE PROMPT, OUTSIDE THE BLOCK,
BEFORE EVERY PROMPT WITHOUT EXCEPTION.**

## THE HEADER — ⚠️ ABOVE THE BLOCK, NEVER INSIDE IT

```
TO         which agent · which window · which repo and branch
ATTACH     the exact filenames, or NONE
BEFORE     what must be true before pasting
AFTER      what comes back, and to whom
```

| # | Ruling |
|---|---|
| 1 | ⚠️⚠️ **THE PROMPT BODY IS SELF-CONTAINED. THE AGENT RECEIVING IT HAS NO CONTEXT BUT THE PASTE AND ITS ATTACHMENTS.** |
| 2 | ⚠️⚠️ **THE HEADER IS NEVER INSIDE THE PROMPT BLOCK. THE BLOCK IS WHAT GETS COPIED; THE HEADER IS WHAT THE OWNER READS TO KNOW WHERE TO PUT IT.** |
| 3 | ⚠️ **ATTACH names files exactly as they appear in project knowledge.** ⚠️⚠️ **A PROMPT REFERRING TO A DOCUMENT THAT IS NOT ATTACHED IS A PROMPT THAT WILL BE ANSWERED FROM INVENTION.** |
| 4 | ⚠️⚠️ **ONE PROMPT, ONE DESTINATION. A PROMPT THAT WOULD GO TO TWO AGENTS IS TWO PROMPTS.** |
| 5 | ⚠️⚠️ **VAIRIFY AND CHAINPASS PROMPTS ARE NEVER COMBINED. TWO COMPANIES, TWO WINDOWS, TWO ATTACHMENT SETS. NEITHER SIDE SEES THE OTHER'S PRICES OR BRANDING.** |
| 6 | ⚠️ **A prompt that destroys anything opens with the salvage step and ends with STOP AND REPORT.** ⚠️⚠️ **NOTHING IS DELETED IN THE SAME PROMPT THAT INVENTORIES IT.** |

## ⚠️ EXAMPLE

```
TO         Claude Code · terminal · ~/vai-workspaces/vairify-app · vairify-fixes
ATTACH     NONE — it reads from the repo
BEFORE     It has read OPERATIONS.md and stated its role back
AFTER      A numbered report. Nothing deleted. Returns here for the ruling.
```

⚠️⚠️ **THEN THE PROMPT BLOCK, AND NOTHING ELSE IN IT.**

---

# 2 — ⚠️⚠️ WHERE EVERYTHING IS

```
Machine     MacBook-Pro, user bmac

VAIRIFY     ~/vai-workspaces/vairify-app
Branch      vairify-fixes

  Canon     docs/canon/                 (Vairify canons; not the ChainPass CP/RULINGS list)
  Screens   docs/screens/
  Schema    supabase/migrations/20260816000000_vairify_schema.sql
            applied to jejeywliehoxwhukphwk
  Functions supabase/functions/

CHAINPASS   ~/vai-workspaces/chainpass-app
Branch      chainpass-fixes

  Canon     docs/canon/                 CANON-CP-01 · CANON-CP-02 · CANON-CP-04 · CANON-MI-36 · FLAG-VAIRIFY-RULINGS-CP-03 · MKT-CP-01 · OPERATIONS · RULINGS-CP-01 · RULINGS-CP-02 · RULINGS-CP-03 · RULINGS-CP-04 · RULINGS-CP-05 · RULINGS-CP-06 · RULINGS-CP-07 · SPEC-FLOW-01
  Screens   docs/screens/               9 entries (`ls docs/screens/ | wc -l` = 9); 166 files recursive
  Schema    docs/chainpass-schema.sql · supabase/migrations/  live on pguwhjearlqqfworantq
  Functions supabase/functions/

SPLASH      ~/vai-workspaces/vairify-splash
```

## 2.1 — ⚠️ HOSTED SUPABASE

| | |
|---|---|
| **Vairify production** | `jejeywliehoxwhukphwk` |
| **ChainPass production** | `pguwhjearlqqfworantq` |
| **Region** | **West US, Oregon** |

## 2.2 — ⚠️ HETZNER

```
ssh -i ~/.ssh/id_ed25519_hetzner root@2.28.18.138
```

⚠️ **Coolify at `http://2.28.18.138:8000`. Traefik proxy. Self-hosted Supabase.**

⚠️ **Face service: ArcFace, container `vai-face-embed`.**

---

# 3 — ⚠️⚠️ VERIFY THE CANON BEFORE READING IT

```
grep -c "SEPARATE BYPASS" ~/vai-workspaces/vairify-app/docs/canon/CANON-MI-25_AUTH_AND_RECOVERY.md
grep -c "SPLIT IS BY ACT" ~/vai-workspaces/vairify-app/docs/canon/CANON-00_GENERAL_RULES.md
grep -c "THE LEVEL IS A GATE, NOT A BUILD" ~/vai-workspaces/chainpass-app/docs/canon/RULINGS-CP-02__2026-08-22_.md
grep -c "TWO FRAMES BUILD THE BASELINE" ~/vai-workspaces/chainpass-app/docs/canon/RULINGS-CP-03__2026-08-22_.md
```

⚠️⚠️ **EXPECT 2 AND 1 AND 1 AND 1. IF ANY RETURNS 0 YOU ARE READING A STALE SET — STOP AND SAY SO.**

> ⚠️⚠️ **THIS HAS ALREADY COST A DAY. A STALE CANON READS AS AUTHORITATIVE AND IS NOT.**

⚠️ **Add a new test to this section every time a ruling lands. The test is the newest
distinctive string in the newest file.**

---

# 4 — ⚠️ THE STANDING RULES ALL FOUR SHARE

| # | |
|---|---|
| 1 | ⚠️⚠️ **EVIDENCE, OR IT DID NOT HAPPEN.** **File and line, or the command and its actual output.** |
| 2 | ⚠️ **An inferred PASS is a fabrication.** |
| 3 | ⚠️⚠️ **A FILE CLAIMING A FACT IS NOT EVIDENCE THE FACT IS TRUE.** ⚠️ **`MIGRATION_ORDER.txt` claimed a verified clean run that never happened. A root `tsconfig.json` with `"files": []` reported a clean compile of nothing.** |
| 4 | ⚠️ **If something is ambiguous, write down the ambiguity. Do not resolve it.** |
| 5 | ⚠️⚠️ **NOTHING PROCEEDS PAST A DECISION THAT IS THE OWNER'S.** |
| 6 | ⚠️ **Every block the owner pastes carries a destination label and starts with `cd` to the exact directory.** |

---

# 5 — ⚠️ COMMANDS THAT MATTER

## 5.1 — ⚠️⚠️ TYPECHECK — THE ROOT CONFIG CHECKS NOTHING

```
cd ~/vai-workspaces/vairify-app
npx tsc --noEmit -p tsconfig.app.json 2>&1 | tee /tmp/tsc.txt | grep -c "error TS"
```

⚠️⚠️ **A BARE `npx tsc --noEmit` COMPILES ZERO FILES. THE ROOT `tsconfig.json` HAS
`"files": []` AND ONLY REFERENCES. IT EXITS CLEAN AND MEANS NOTHING.**

## 5.2 — ⚠️ MIGRATIONS

| | |
|---|---|
| ⚠️⚠️ **NEVER** | **`supabase db reset` — it drops the database** |
| **Hosted** | **`supabase db push`** |
| **Self-hosted** | **`scp` the file, then `docker exec psql`** |

## 5.3 — ⚠️ DNS

⚠️⚠️ **NAMECHEAP `setHosts` OVERWRITES ALL RECORDS ATOMICALLY. ANY AUTOMATED CHANGE MUST
FETCH AND RE-INCLUDE THE EXISTING MX AND TXT RECORDS FIRST.**

---

# 6 — ⚠️ THE TWO COMPANIES

⚠️⚠️ **SEPARATE LEGAL ENTITIES. NEVER CONFLATED.**

| | |
|---|---|
| ⚠️ **CHAINPASS** | **Delaware C-Corp. B2B identity infrastructure. Issues the V.A.I.** ⚠️ **CHAINPASS VERIFIES.** `chainpass.io` |
| ⚠️ **VAIRIFY** | **Incorporated in Colombia. Consumer safety platform. Launch partner for the V.A.I.** ⚠️ **VAIRIFY CHECKS.** `vairify.io` |

| # | |
|---|---|
| 1 | ⚠️⚠️ **CHAINPASS AND VAIRIFY PRICE FIGURES NEVER APPEAR IN THE SAME FILE.** |
| 2 | ⚠️ **`settings:price_vai` and `settings:price_vai_pro` are ChainPass's. Vairify package keys must never appear in this repo.** |
| 3 | ⚠️⚠️ **SAFETY IS NEVER ASSOCIATED WITH A CHARGE.** |
| 4 | ⚠️ **The Council governs Vairify, not ChainPass** — **it has exactly as much power over ChainPass as it has over Microsoft.** |

---

# 7 — ⚠️ NAMING — LOCKED

## 7.1 — ⚠️⚠️ THE VAI RULE — RULED 20 AUGUST

⚠️⚠️ **VAI IS ALWAYS BOLD AND ALWAYS CAPITAL, WHEREVER IT APPEARS, INSIDE ANY WORD.**

⚠️⚠️ **IN A BRAND ASSET THE WHOLE NAME IS CAPITAL.**

| Where | Form |
|---|---|
| ⚠️⚠️ **BRAND ASSET — a screen, the website, print, a logo, anything a member reads** | ⚠️⚠️ **THE WHOLE NAME IN CAPITALS, VAI BOLD.** **VAIRIFY · VAIRIDATE · VAI-CHECK · VAIPULSE · V.A.I.** |
| ⚠️ **Canon and internal prose** | ⚠️ **VAI bold and capital, the rest as written.** **VAIRIFY · VAIRIDATE · VAI-CHECK · VAIPULSE** |

❌ ⚠️⚠️ **"VAIRIFY" IS NEVER WRITTEN IN COPY IN MIXED CASE. NOT "VAIRIFY", NOT "VAIRIFY".
THE SAME HOLDS FOR VAIRIDATE.**

⚠️ **This supersedes the "Vairify" row in the table below.**

---

| ✅ Correct | ❌ Never |
|---|---|
| ⚠️⚠️ **VAIRIFY** | ⚠️⚠️ **Vairify · Verify · VAIrify** |
| **VAI** — always capitalised, always bold | **Vai · vai** |
| ⚠️⚠️ **V.A.I. · VAI-CHECK · VAIPULSE · VAIRIDATE** | ⚠️ **Vairidate · lowercase variants** |
| **TruRevu** | **wrong-capital product name** |
| **`chainpass.io`** | **the .id domain — lost, unrecoverable** |
| **Patent pending** | **patented · patent granted** |
| ⚠️ **Revenue sharing** | ⚠️⚠️ **AFFILIATE — BANNED PROJECT-WIDE** |
| ⚠️ **My VAIRIFY** | ⚠️⚠️ **CONNECTIONS — RETIRED 15 AUGUST** |
| ⚠️ **NATIONAL** | ⚠️ **Nationwide** |

⚠️ **Banned: groundbreaking · innovative · "matters."**

---

# 8 — ⚠️ THE THREE TIER LINES

| Tier | |
|---|---|
| ⚠️⚠️ **FREE** | **THE SAFETY TIER** |
| ⚠️ **PLUS** | **STAY CONNECTED AND SOCIAL** |
| ⚠️ **PREMIUM** | **THE TOOLS YOU NEED TO RUN YOUR BUSINESS** |

⚠️⚠️ **THE SPLIT IS BY ACT, NEVER BY ROLE. PLUS FINDS. PREMIUM IS FOUND.**

⚠️ **Nothing in the product encodes who is a provider and who is a client.**

---

# 9 — ⚠️ SCREEN NUMBERING

```
SA-01-SN-03 · CANON-SA-01 §6
```

| # | |
|---|---|
| 1 | **Canon code · `-SN` · number** |
| 2 | ⚠️⚠️ **CONTINUOUS PER CANON. NEVER REUSED. A RETIRED SCREEN KEEPS ITS NUMBER AND IS STAMPED.** |
| 3 | ⚠️ **No lettered suffixes. A variant is a screen.** |
| 4 | ⚠️ **States are screens.** |
| 5 | ⚠️⚠️ **EVERY SCREEN CITES ITS CANON SECTION ON THE RAIL ROW.** ⚠️ **Without it someone reads 449 lines to find one rule.** |
| 6 | ⚠️ **A print copy carries the numbers of the screens it prints and never new ones.** |
| 7 | ⚠️ **Where two canons are paired, the file carries both codes and the screens are numbered once in a shared range** — `MI-28-29-SN` · `PL-09-PR-18-SN`. |

---

# 10 — ⚠️⚠️ BREAKPOINTS, NAMED ONCE

| Name | Width |
|---|---|
| **Phone** | **≤ 599** ⚠️ **390 is the drawn reference** |
| **Tablet** | **600 → 1023** |
| **Desktop** | **≥ 1024** |

⚠️ **No screen defines its own. Logical properties throughout. RTL is not deferrable.**

⚠️⚠️ **FOUR CANONS STAY A CENTRED 390 COLUMN AT ANY WIDTH: `SA-01` VAI-CHECK · `SA-02`
DATEGUARD · `SA-04` VAIPULSE · `MI-24` REGISTRATION.**

---

# 11 — ⚠️ WHAT IS CURRENTLY BROKEN

| # | | Where |
|---|---|---|
| 0 | ⚠️⚠️ **GATE-LAUNCH-01 — TERMS DRAFT LIVE. `agreement_versions` `0-DRAFT` on `vairify` is a build-test marker, not legal text. NO REAL MEMBER MAY ENROL UNTIL OWNER · COUNSEL REPLACE IT WITH REAL TERMS AND RE-POINT `platform_agreements`.** | `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` |
| 1 | ⚠️⚠️ **LOGIN IS BROKEN END TO END.** **Three contract items.** | `PLAN-DB-02` §6 items 1–3 |
| 2 | ⚠️ **735 type errors, uninventoried** | `tsconfig.app.json` |
| 3 | ⚠️⚠️ **DATEGUARD FIELD RENAMES. FIVE EDGE FUNCTIONS IN THE ALARM PATH QUERY NAMES THAT NO LONGER EXIST.** | `supabase/functions/` |
| 4 | ⚠️ **The contact handoff is not in the contract.** **Nine items, none is this, and it is a column.** | `PLAN-DB-02` §6 |
| 5 | ⚠️ **Operator log: `settings_audit` lands SN-44 saves. Other admin actions still need a shared log.** | The schema |
| 6 | ⚠️ **`user_roles.role` is `admin · moderator · member`. No SUPER, no SUPPORT.** | The schema |
| 7 | ⚠️ **`platform_settings` singleton (legacy). Live dials are `public.settings` key·value — SN-44 Master Settings is the surface.** | SN-44 · `master-settings` |
| 8 | ⚠️ **ChainPass: the completion primary key blocks append-only renewals. RLS on 2 tables of 16.** | `chainpass-schema.sql` |

---

**17 August 2026.**

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **26 Aug** | 9 | ⚠️⚠️ **§2 — `RULINGS-CP-07` indexed under CHAINPASS.** | CP-CANON-FIX-01 UNIT 1 item 2 |
| **26 Aug** | 8 | ⚠️⚠️ **§2 — ChainPass canons indexed under CHAINPASS, not VAIRIFY. Screens line corrected: `docs/screens/` exists (9 top-level, 166 files). Eight previously unindexed files listed: CANON-CP-02, CANON-CP-04, CANON-MI-36, FLAG-VAIRIFY-RULINGS-CP-03, RULINGS-CP-04, RULINGS-CP-05, RULINGS-CP-06, SPEC-FLOW-01.** | CP RUN #1 BUILD UNIT 11 |
| **24 Aug** | 4 | ⚠️⚠️ **MORE DIALS LIVE — handoff poll · blocks burn window · contracts face attempts · testing 95% skip removed.** | Owner no-number ruling |
| **24 Aug** | 3 | ⚠️⚠️ **WINDOWS + DEFERRAL — `enrol_session_hours` · facial attempt/signature windows · `deferral_suspend_after` on reveal + check-renewals suspend.** | Owner no-number ruling · §4A.3 |
| **24 Aug** | 2 | ⚠️⚠️ **SETTINGS WIRING — handoff counts · `renewal_window` on check-renewals · `recovery_otp_max_attempts` · `blocks_alert_threshold` on blocks status · `credentials.reds_count` + fourth-state via `reds_threshold` · verify-vai-facial bands from settings (no `FACE_MATCH_THRESHOLD`).** | Owner no-number ruling |
| **24 Aug** | 1 | ⚠️⚠️ **SN-44 LIVE — `master-settings` list/set · `settings_audit` · named missing keys seeded UNSET. §11 item 7 restated: dials live on `public.settings`, not the legacy singleton.** | Settings control matrix · owner no-number ruling |
| **25 Aug** | 6 | ⚠️⚠️ **SCRFD DECODE FIXED.** `detect_face` on `vai-face-embed` now decodes per-stride score maps, bbox deltas and kps deltas (strides 8/16/32, 2 anchors), scales back, NMS. Backup `/root/main.py.bak-1787620957`. `POST https://vec.chainpass.io/embed` on a real single face returns HTTP 200, vector length 512, no `multiple_faces_detected`. | Owner numbered prompt 25 Aug |
| **25 Aug** | 5 | ⚠️⚠️ **LIVE FACE SERVICE WIRED.** `vec.chainpass.io` serves `vai-face-embed` over HTTPS with a Let's Encrypt cert; hosted `FACE_SERVICE_URL` flipped to `https://vec.chainpass.io/embed` (KEY unchanged). `enrol-baseline` (+ `_shared/enrol-baseline`, `_shared/face-service-stub`, `_shared/face-client`) now POST the live contract `JSON { image: base64 }`; the stub accepts it too. Six face-callers redeployed. **Container model pack on disk: `glintr100_int8.onnx` (recogniser, AuraFace build) · `scrfd_10g_bnkps.onnx` (SCRFD detector) · `2d106det.onnx` (106-pt landmarks) — bind-mounted read-only from `/root/models/face-matching`, source `https://huggingface.co/fal/AuraFace-v1`, SHA-256s in `/app/models/checksums.txt`.** | Live cutover, 25 Aug |
| **23 Aug** | 7 | ⚠️⚠️ **§7 naming: the third feed scope is NATIONAL.** | `RULINGS-VA-01` 23 Aug. |
| **22 Aug** | 6 | ⚠️⚠️ **`RULINGS-CP-03` FILED — terms on acceptance, two-frame baseline, Pro uncapped, recovery at ChainPass. Verify test added §3.** | Owner's spoken word, 22 Aug |
| **22 Aug** | 5 | ⚠️⚠️ **`RULINGS-CP-02` FILED — enrolment, levels, branding. Folded into `CANON-CP-01` changelog #22. Verify test added §3.** | Owner's spoken word, 22 Aug |
| **22 Aug** | 4 | ⚠️⚠️ **§11 ROW 0 — GATE-LAUNCH-01 flagged. Terms draft `0-DRAFT` live on `vairify`; no real member may enrol until replaced.** | `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` |
| **22 Aug** | 3 | ⚠️ **Banned-words list: the already-purged first term deleted.** The list entry was stale. Superseded lines are deleted, never marked. | Task 10 |
| **22 Aug** | 2 | ⚠️⚠️ **Vairify package keys purged from this file. ChainPass credential keys remain `settings:price_vai` / `settings:price_vai_pro`.** | Canon §1.1a · two-company split |
| **22 Aug** | 1 | ⚠️⚠️ **REAL FIGURES → `settings:price_vai`, `settings:price_vai_pro`. BREAKPOINTS LEFT (ILLUSTRATIVE/DESIGN).** | CANON-00 §16. |
| **17 Aug** | 1 | **Filed.** | |
| **20 Aug** | 4 | ⚠️⚠️ **§7.1 ADDED — THE VAI RULE. VAI IS ALWAYS BOLD AND CAPITAL, INSIDE ANY WORD. A BRAND ASSET CARRIES THE WHOLE NAME IN CAPITALS.** The naming table's "Vairify" row is superseded — it is VAIRIFY. | ⚠️⚠️ **THE OLD TABLE BANNED "VAIrify" BUT PERMITTED "Vairify", WHICH IS THE FORM THE OWNER RULED OUT OF COPY.** |
| **20 Aug** | 3 | ⚠️⚠️ **§0 ADDED — GUESSING IS NOT ALLOWED. ANSWERS ARE A PARAGRAPH UNLESS EXPANSION IS ASKED FOR.** | ⚠️⚠️ **A PLAUSIBLE ANSWER ASSEMBLED FROM NOTHING GETS BUILT. AND A CHANGE REPORTED WITHOUT A COMMAND AND ITS OUTPUT IS NOT A CHANGE.** |
| **20 Aug** | 2 | ⚠️⚠️ **§1.3 ADDED — EVERY PROMPT CARRIES A TO/ATTACH/BEFORE/AFTER HEADER, ABOVE THE BLOCK.** | ⚠️⚠️ **PROMPTS TRAVEL BY CLIPBOARD. THE PASTED BLOCK ARRIVES WITH NO CONTEXT, SO THE DESTINATION AND THE ATTACHMENTS CANNOT LIVE INSIDE IT.** ⚠️ **A prompt citing an unattached document gets answered from invention.** |

---

**Amended 20 August 2026.**
