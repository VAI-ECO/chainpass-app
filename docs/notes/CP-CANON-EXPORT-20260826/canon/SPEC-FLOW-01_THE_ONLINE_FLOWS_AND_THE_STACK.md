# SPEC-FLOW-01 — THE ONLINE FLOWS AND THE STACK

**25 August 2026. Every online flow, step by step, with the technology placed at each step
and the canon section it implements. Ends in a schematic and one build prompt.**

⚠️⚠️ **DERIVES FROM `CANON-CP-01`, `CANON-CP-02`, `CANON-MI-22`, `CANON-MI-33/34/35`,
`CANON-MI-36`, `CANON-SA-01`, `RULINGS-VA-05`, `RULINGS-CP-05` AND `RULINGS-CP-06`.
WHERE THIS FILE AND A CANON DISAGREE, THE CANON GOVERNS.**

⚠️ **Every server fact in §2 is `[V]` — read off `2.28.18.138` on 25 August. Every canon
fact is `[D]`. Nothing here is `[?]`.**

⚠️⚠️ **§0.1 BELOW IS SUPERSEDED.** `CANON-CP-02` §5 item 3 re-closed it the other way:
the security layer is a ChainPass page, platform-branded, before the handoff.
`CANON-MI-33`'s locked copy migrates onto that page word for word.

---

# 0 — ⚠️⚠️ TWO DECISIONS TAKEN, SO THE FLOWS CAN BE WRITTEN

**The owner delegated both. They are recorded here. §0.1 was reversed the same day.**

## 0.1 — ⚠️⚠️ SUPERSEDED 25 AUGUST — `CANON-CP-02` §5 item 3

❌ **Do not build recovery screens on Vairify.**

⚠️⚠️ **THE SECURITY LAYER IS A CHAINPASS PAGE, PLATFORM-BRANDED, RUNNING BEFORE THE
HANDOFF.** Locked copy in `CANON-MI-33` §2 migrates onto it word for word.

| Was | Now |
|---|---|
| Custody moves, screens stay on Vairify | Custody and screens at ChainPass |
| `CANON-MI-35` §0 stage 2 is Vairify-owned | Stage 2 leaves Vairify — `CANON-CP-02` §5 item 4 |
| Recovery endpoints as a ninth surface for Vairify to render against | Retrieval page is ChainPass. Vairify never sets or stores questions or codes — `CANON-CP-02` §4.1 item 2 |

## 0.2 — SIX DISGUISE ICONS. NO PREFIX.

⚠️⚠️ **`RULINGS-VA-05` §15 CLOSED. `CANON-MI-35` §3 LOCKED COPY GOVERNS —** Accounting ·
Property Management · Insurance · Courier Service · Travel · Business Solutions, plus the
VAIRIFY icon selected by default.

⚠️ **`CANON-MI-24` §6.2's seven-with-a-`V `-prefix and §10 item 1's five are deleted.** The
six are what was drawn and accepted. ⚠️⚠️ **A `V ` PREFIX IS A TELL. SIX APPS ON ONE PHONE
ALL STARTING WITH V IS A SET, AND A SET IS THE THING THE DISGUISE EXISTS TO AVOID.**

---

# 1 — ⚠️⚠️ THE THREE QUESTIONS THE WHOLE SYSTEM ASKS

**Every online flow below is one of these three, and nothing else.**

| | Question | Who answers | Canon |
|---|---|---|---|
| **1** | ⚠️ **IS THIS A REAL PERSON, AND WHO** | ⚠️ **The KYC provider, once, at enrolment** | `CP-02` §1 step 6 |
| **2** | ⚠️⚠️ **IS THIS THE SAME PERSON AS THE BASELINE** | ⚠️⚠️ **CHAINPASS, EVERY TIME, FOREVER** | `CP-01` §6, §7 |
| **3** | ⚠️ **MAY THIS PERSON BE HERE** | ⚠️ **The platform** | `MI-22` §8 · `CP-01` §16.3 |

⚠️⚠️ **CHAINPASS DECIDES WHO A PERSON IS. VAIRIFY DECIDES WHAT THAT PERSON MAY DO HERE.
NEITHER EVER DOES THE OTHER'S JOB** — `CANON-MI-22` §1.

---

# 2 — ⚠️⚠️ THE TECHNOLOGY, PLACED

## 2.1 — THE FACE SERVICE `[V]`

**Host `2.28.18.138` · Coolify · Traefik · container `vai-face-embed` · compose
`/root/vai-face-embed/docker-compose.yml`, `build: .`**

| Layer | File on disk | Size | What it does |
|---|---|---|---|
| ⚠️ **DETECTION** | `scrfd_10g_bnkps.onnx` | 16.9 MB | **Finds the face in the frame** and returns a box plus five keypoints. SCRFD redistributes compute across scales, which is why it is fast at this accuracy. |
| ⚠️ **LANDMARKS** | `2d106det.onnx` | 5.0 MB | **106 points.** Rotates and crops the face to a standard position so the recogniser always sees the same geometry. |
| ⚠️⚠️ **RECOGNITION** | `glintr100_int8.onnx` | 65.6 MB | **ResNet-100 trained with the ArcFace loss on Glint360K.** Turns the aligned crop into a **512-number embedding**. |

| # | Fact | |
|---|---|---|
| 1 | ⚠️⚠️ **THE COMPARISON IS COSINE SIMILARITY BETWEEN TWO 512-NUMBER LISTS.** That similarity is the percentage `CANON-CP-01` §7.3 says never leaves ChainPass unless `response_level` is 3 — `RULINGS-CP-04`. **The bands are cuts on it.** |
| 2 | ⚠️ **AuraFace and ArcFace are not two models.** ArcFace is the training loss; Glintr100 is the weight; `fal/AuraFace-v1` is the **Apache 2.0** release of it. ⚠️⚠️ **THE PERMISSIVE LICENCE IS AN ASSET — INSIGHTFACE'S OWN WEIGHTS ARE RESEARCH-ONLY. RECORD IT ON THE SUPPLIER ROW** — `CP-01` §14.4. |
| 3 | ⚠️ **INT8, quantised locally** by `/root/quantize_model.py` (`quantize_dynamic`, QUInt8). The FP32 source sits on the host, unmounted. ⚠️⚠️ **THE BANDS MUST BE MEASURED AGAINST THE INT8 MODEL. A SWAP TO FP32 MEANS RE-MEASURING THEM.** |
| 4 | ⚠️ **Models are mounted read-only** — `/root/models/face-matching:/app/models:ro`. The image does not download them. Provenance is `checksums.txt`, 5 August. |
| 5 | ⚠️⚠️ **`MODEL_VERSION` IS HARDCODED AT `main.py:19` AND IS NOT READ FROM THE FILE.** `CP-01` §16.2 `baselines.engine` is written per baseline. **IF THAT COLUMN IS WRITTEN FROM THIS STRING WHILE THE FILE UNDERNEATH CHANGES, BASELINES ARE ATTRIBUTED TO THE WRONG ENGINE. DERIVE IT FROM THE CHECKSUM.** |

## 2.2 — ⚠️⚠️ `vec.chainpass.io` — LAUNCH BLOCKER `[V]`

⚠️⚠️ **NXDOMAIN AT FILING. TRAEFIK IS ALREADY LISTENING FOR THAT HOST.** Confirm live
before treating this line as current — `OPERATIONS` §0 item 3.

⚠️ **Every face check in both products routes through that name.** ⚠️⚠️ **`OPERATIONS` §5.3
— NAMECHEAP `setHosts` OVERWRITES ALL RECORDS ATOMICALLY. FETCH AND RE-INCLUDE THE EXISTING
MX AND TXT FIRST.**

## 2.3 — EVERY OTHER SUPPLIER, AND WHOSE IT IS

| Supplier | Whose | Job | Canon |
|---|---|---|---|
| ⚠️ **THE KYC PROVIDER** (ComplyCube) | ⚠️ **CHAINPASS** | Document check, document-to-face, liveness, duplicate detection. **Embedded in a frame, never a redirect.** | `CP-01` §2.2, §5 |
| ⚠️⚠️ **`vai-face-embed`** | ⚠️⚠️ **CHAINPASS** | Every comparison in the ecosystem. Baselines, matcher, image serve. | `CP-01` §FACIAL STACK · `RULINGS-CP-05` |
| ⚠️ **The picker** (Offenders.io) | ⚠️ **CHAINPASS, outside its walls** | Background check. **Binary. Clear, or something on file.** No detail, no record, no score. | `CP-02` §0 · `CP-01` §4 |
| ⚠️ **Telnyx** | ⚠️ **BOTH, separately** | ChainPass: the enrolment OTP. Vairify: DateGuard guardian alerts. ⚠️⚠️ **DATEGUARD NEVER SITS ON A BETA CHANNEL — SMS, NOT EMAIL** — `CANON-00` §14.1. | `CANON-00` §14.1 |
| ⚠️ **Trolley** | ⚠️ **CHAINPASS** | Commission payouts. ChainPass holds only a `trolley_recipient_id`. | `CP-01` §14.5a |
| ⚠️ **Supabase — `pguwhjearlqqfworantq`** | ⚠️ **CHAINPASS** | Credentials, baselines, agreements, proofs, ledgers, settings. | `CP-01` §16.2 · `SPEC-CP-02` |
| ⚠️ **Supabase — `jejeywliehoxwhukphwk`** | ⚠️ **VAIRIFY** | Accounts, events, feed, DateGuard, settings. | `OPERATIONS` §2.1 |
| ⚠️ **PWA** | ⚠️ **VAIRIFY** | Installed from the website, never an app store. | `MI-35` |

## 2.4 — ⚠️⚠️ WHAT THE STACK DOES NOT DO, STATED SO NOBODY ASSUMES IT

⚠️⚠️ **ARCFACE ANSWERS "SAME FACE." IT DOES NOT ANSWER "LIVE PERSON." HOLD A PRINTED
PHOTOGRAPH TO THE CAMERA AND A GOOD RECOGNISER SAYS GREEN — CORRECTLY. IT IS THE SAME
FACE.**

| Surface | Covered by | |
|---|---|---|
| ⚠️ **ENROLMENT** | ⚠️ **The KYC provider's own liveness**, bound to ChainPass's frame by simultaneity | `CP-01` §2.7 ✅ |
| ⚠️ **VAI-CHECK AT THE DOOR** | ⚠️⚠️ **A HUMAN.** The witness is the check. | `SA-01` §0.1 ✅ |
| ⚠️⚠️ **LOGIN, ALONE ON A PHONE** | ⚠️⚠️ **NOTHING. NOBODY IS WATCHING.** | ⬜ **UNRULED** |

⬜ ⚠️⚠️ **OWNER + MA-03: DOES LOGIN NEED A PRESENTATION-ATTACK MODEL, OR IS THE
CONSEQUENCE OF A DEFEATED LOGIN SMALL ENOUGH TO ACCEPT?**

---

# 3 — ⚠️⚠️ THE SEAM. WHAT CROSSES, AND WHAT NEVER DOES.

```
        VAIRIFY                    ⚠️⚠️ THE WALL ⚠️⚠️                CHAINPASS
   ┌──────────────────┐                                        ┌──────────────────┐
   │ a V.A.I. string  │  ── a captured frame ──────────────→   │ the legal name   │
   │ an account       │                                        │ the document     │
   │ a username       │  ←──────────── a BAND ──────────────   │ the baseline     │
   │ email · phone    │        shaped by response_level        │ the photograph   │
   │ events           │        rebaseline_required             │ the embeddings   │
   │ the feed         │                                        │ the arithmetic   │
   │ DateGuard        │  ←──── a credential STATE ──────────   │ the agreements   │
   └──────────────────┘        active · not active             │ the proofs       │
                                                               └──────────────────┘
```

| ⚠️ CROSSES INTO VAIRIFY | ❌ NEVER CROSSES |
|---|---|
| **The V.A.I.** | ⚠️⚠️ **THE LEGAL NAME** |
| **Username, email, phone** — collected on Vairify's behalf | **The document** |
| **A band** — and a percentage only when `response_level` is 3 | ⚠️⚠️ **A SCORE VAIRIFY STORES OR COMPUTES** |
| **A credential state** — one word, never why | **The baseline or any embedding** |
| **`rebaseline_required`** | **The photograph, except served to the user's own screen and never stored** |
| **The health signal** | **Any reason code** |
| **An agreement number** — `SPEC-CP-02` | **The contract bytes, the answers, the timestamps** |

⚠️⚠️ **THE COURIER RULE: CHAINPASS ONLY EVER HANDS BACK DATA IT COLLECTED ON THAT
PLATFORM'S BEHALF. IT NEVER HANDS BACK ITS OWN VERIFIED DATA** — `CP-01` §2.9.

---

# 4 — FLOW ONE · ENROLMENT

⚠️ **`CANON-CP-02` §1 GOVERNS. THIRTEEN STEPS. PAY AT STEP 2. SESSION KEY 30 CHARACTERS
AT STEP 3. FACE MATCH AT STEP 10. RETRIEVAL AND REMEMBER AT 11 / 11a. DO NOT BUILD FROM
AN ELEVEN-STEP TABLE.**

Simultaneity at the KYC camera still stands — `CANON-CP-01` §2.7.

The return, platform side: cookie, webhook, vault, poll if the redirect beats the webhook —
`CANON-CP-02` §4 items 3–5.

---

# 5 — FLOW TWO · ONBOARDING — AFTER THE HANDOFF

⚠️ **`CANON-MI-35` §0 as amended by `CANON-CP-02` §5 item 4.**

| Stage | Screen | Whose | Canon |
|---|---|---|---|
| **1** | Enrolment including retrieval and remember | ⚠️⚠️ **CHAINPASS** | `CANON-CP-02` |
| **2** | **THE PACKAGE PAGE** | ⚠️⚠️ **VAIRIFY** | `MI-34` |
| **3** | ⚠️ **THE INSTALL PAGE — LAST** | ⚠️⚠️ **VAIRIFY** | `MI-35` |

⚠️⚠️ **STAGE 2 IS NO LONGER THE SECURITY LAYER. THAT PAGE LEFT VAIRIFY.**

---

# 6 — FLOW THREE · LOGIN, EVERY DAY

⚠️ **`CANON-MI-22` §3.** Vairify opens a camera, transmits, stores nothing. ChainPass
compares. A band returns. Session created or not.

Failure paths: `CANON-MI-36`. Do not restate them here.

---

# 7 — FLOW FOUR · VAI-CHECK

⚠️ **`CANON-SA-01`.** One rule, two timings. Mutual consent is a `parties = 2` registered
contract displayed by ChainPass — `SPEC-CP-02` §12 item 5. Vairify does not record the
version or proof of display.

---

# 8 — FLOW FIVE · FAILURE AND RE-BASELINE

| Path | Canon |
|---|---|
| Individual failure | `CANON-MI-36` §1 |
| System-wide failure | `CANON-MI-36` §2 · control: `RULINGS-CP-05` |
| Lifetime red count (forced re-baseline) | `CANON-CP-01` §9.1 · §10.2 two-date test |
| User-requested re-baseline | `RULINGS-CP-06` — always the provider. Not a lock path. |

⚠️⚠️ **A LOCKED ACCOUNT DOES NOT USE THE REQUESTED RE-BASELINE.** `CANON-MI-36` §1.1.

---

# 9 — ⚠️⚠️ THE SCHEMATIC

```
                                    ⚠️ THE USER'S PHONE
                          ┌──────────────────────────┐
                          │   PWA · vairify.io       │
                          │   installed, disguised   │
                          └────────────┬─────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
       ⚠️ ENROL ONCE            ⚠️ EVERY DAY             ⚠️ EVERY MEETING
              │                        │                        │
              ▼                        ▼                        ▼
   ╔══════════════════╗      ╔══════════════════╗    ╔══════════════════╗
   ║ CHAINPASS        ║      ║ VAIRIFY          ║    ║ VAIRIFY          ║
   ║ 13 steps · CP-02 ║      ║ V.A.I. + camera  ║    ║ QR + two cameras ║
   ╚════════╤═════════╝      ╚════════╤═════════╝    ╚════════╤═════════╝
            │                         │                       │
            │                         └───────────┬───────────┘
            ▼                                     ▼
   ┌─────────────────┐              ╔═══════════════════════════════════╗
   │ KYC PROVIDER    │              ║  vec.chainpass.io                 ║
   │ embedded frame  │              ║  Traefik → vai-face-embed         ║
   └────────┬────────┘              ║  SCRFD · 2d106det · glintr100     ║
            │                       ╚═════════════════╤═════════════════╝
            ▼                                          ▼
   ╔═══════════════════════════════════╗      ⚠️ A BAND LEAVES
   ║ CHAINPASS · pguwhjearlqqfworantq  ║      shaped by response_level
   ║  credentials · baselines          ║               │
   ║  contract registry · SPEC-CP-02   ║               ▼
   ║  service_state · RULINGS-CP-05    ║      ╔══════════════════════════╗
   ║  questions · OTPs · locks         ║      ║ VAIRIFY                  ║
   ╚═══════════════════════════════════╝      ║ jejeywliehoxwhukphwk     ║
                                              ║ ❌ no face · no vector   ║
                                              ╚══════════════════════════╝
```

---

# 10 — ⚠️⚠️ WHAT IS NOT BUILT, AND WHAT IS WRONG

| # | | Where |
|---|---|---|
| 1 | ⚠️ **`vec.chainpass.io` DNS — confirm live. Do not assert NXDOMAIN without a fresh lookup.** | DNS |
| 2 | ⚠️⚠️ **THE ADAPTER LAYER** — `CP-01` §14.4 item 4. One normalised shape. | Partially built under `RULINGS-CP-04` |
| 3 | ⚠️⚠️ **CHAINPASS STILL HOLDS `credentials.complycube_client_id`, NOT NULL, READ BY FOUR FUNCTIONS AFTER ENROLMENT. THE PATENT GATE IS UNMET.** | `CP-01` §12 item 6 |
| 4 | ⚠️ **The reverse channel does not exist.** Serve-manual, re-scan, fraud-found. | `SA-01` §16 |
| 5 | ⚠️ **`settings:package_page_clock_start` is named in canon, not seeded, not read.** | `MI-34` §0 |
| 6 | ⚠️⚠️ **`public.settings` IS SELECT-ONLY FROM EVERY PATH. NO VAIRIFY ADMIN SURFACE WRITES IT.** | `RULINGS-VA-05` §13 |
| 7 | ⚠️ **`events` exists. `vai_check_sessions` and `encounters` do not, and never will.** | `RULINGS-VA-05` §9 |
| 8 | ⚠️ **`MODEL_VERSION` hardcoded and not derived from the file.** | `main.py:19` |
| 9 | ⬜ ⚠️ **PRESENTATION-ATTACK DETECTION AT LOGIN — UNRULED.** | §2.4 |
| 10 | ⚠️ **Contract registry five tables — `SPEC-CP-02` §4 — not built.** | Schema |
| 11 | ⚠️ **Service state control — `RULINGS-CP-05` — not built.** | Schema |
| 12 | ⚠️ **Re-baseline request surface — `RULINGS-CP-06` — not built.** | API |

---

# 11 — ⚠️ THE PROMPT

**Held in the filing. Not executed by this deposit.** Work items in §10 remain owed.
Enrolment sequence in any prompt that still says eleven steps is stale — use `CANON-CP-02`.

---

# 12 — ⬜ STILL OWED BY THE OWNER

| # | | Blocks |
|---|---|---|
| 1 | ⚠️ **Presentation-attack detection at login** — §2.4 | Nothing. It is an addition, not a gap |
| 2 | ⚠️⚠️ **INTEGRATION MONEY DIRECTION** | `BRIEF-CP-01` §5 |
| 3 | ⚠️⚠️ **WHICH RAIL FUNDS THE PER-ENROLMENT FEE** | `RULINGS-VA-04` §5 |
| 4 | ⚠️⚠️ **RENEWAL ATTRIBUTION** | `CP-01` §16.4 |
| 5 | ⚠️ **The signature agreement — which document it actually is** | `DESIGN-BRIEF-CP-01` CP-07, blocking |
| 6 | ⚠️ **The band cut-offs** — measured in the pilot, against the INT8 model | Nothing until the pilot runs |
| 7 | ⚠️ **"PASS" as a level name** | `CANON-CP-02` §5 item 6 |
| 8 | ⚠️ **Does the user pay for a requested re-baseline?** | `RULINGS-CP-06` §7 |

Branding at the boundary is **closed** — platform-branded ChainPass pages — `CANON-CP-02` §5 item 5.

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. Six online flows, the technology placed per step, the seam, the schematic and the build prompt. | The flows existed across eleven canon files and the technology existed on a server nobody had read. |
| **25 Aug** | 2 | §0.1 **superseded the same day** by `CANON-CP-02` §5 item 3. | Owner re-closed recovery screens onto ChainPass. |
| **25 Aug** | 3 | §0.2 — six disguise icons, no prefix. | A `V` prefix is a tell. |
| **25 Aug** | 4 | §2.4 — the liveness gap stated rather than assumed. | A recogniser answers "same face", not "live person". |
| **25 Aug** | 5 | Enrolment, onboarding, failure and agreement flows pointed at later canons rather than restated. | Restating them here would freeze a superseded sequence. |

---

**Deposited 25 August 2026 to both repos' `docs/canon/`.**
