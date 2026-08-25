# CANON-MI-36 — THE RECOVERY PATHS

**Owner ruling, 25 August 2026. Two paths, and one copy rule that governs every document in
both products.**

⚠️⚠️ **THIS FILE IS THE OFFICIAL SEQUENCE FOR BOTH FAILURES. EVERY EARLIER STATEMENT IN ANY
FILE IS SUPERSEDED.**

---

# 0 — ⚠️⚠️ THE COPY RULE. IT GOVERNS EVERY FILE, EVERY SCREEN, EVERY BRIEF.

⚠️⚠️ **USER. PROVIDER. CLIENT. NEVER A PRONOUN.**

| ✅ | ❌ |
|---|---|
| **the user** · **the provider** · **the client** · **the member** · **both parties** | ⚠️⚠️ **Third-person singular gendered pronouns, and they when it stands for one person.** |

| # | |
|---|---|
| 1 | ⚠️⚠️ **`CANON-00` ALREADY FORBIDS THE PROTOCOL ENCODING WHO IS PROVIDER AND WHO IS CLIENT. THIS EXTENDS IT TO THE WRITING, WHICH IS WHERE IT KEPT SLIPPING.** |
| 2 | ⚠️ **"One party scans and the other accepts" is the sentence. Naming a gender on one side hands a designer the role assignment before a single screen is drawn.** |
| 3 | ⚠️⚠️ **BOTH SIDES ENROL. BOTH SIDES SCAN. BOTH SIDES ARE VERIFIED. A DOCUMENT THAT ASSIGNS A GENDER TO ONE SIDE SAYS PROVIDERS ARE CHECKED AND CLIENTS ARE NOT.** |
| 4 | ⚠️ **Where a sentence needs a pronoun to work, rewrite the sentence.** |
| 5 | ⚠️⚠️ **A SWEEP IS OWED ACROSS EVERY CANON FILE, SCREEN AND BRIEF.** ⚠️ **`DESIGN-BRIEF-CP-01` alone carries nine.** |

**Verify:** `grep -rniE` of those banned forms across `docs/` → 0. The pattern cannot be written out in this file or the file fails its own check.

---

# 1 — INDIVIDUAL FAILURE

⚠️ **One user. The system is fine.**

```
1  ⚠️ THE USER FAILS THE FACE THE MAXIMUM NUMBER OF TIMES THE ADMIN SET
        ↓        ⚠️⚠️ settings:attempt_max — ONE, TWO OR THREE. NEVER A LITERAL
        ↓        THREE IN COPY. THE LAST ATTEMPT RUNS ON THE PREMIUM ENGINE.
        ↓        ⚠️⚠️ RETRY NEVER RESETS THE COUNTER. ATTEMPTS ONLY GO UP.
2  ⚠️ THE LAST SELFIE GOES TO CHAINPASS AND THE FAILURE IS WRITTEN ON THE CREDENTIAL
        ↓
3  ⚠️ BOTH CHANNELS ARE NOTIFIED — EMAIL AND PHONE
        ↓        ⚠️⚠️ ONCE. HERE. NOT AGAIN AT THE LOCK.
4  ⚠️ PAST THE SCANNER TWO WAYS — A ONE-TIME PASSWORD, OR AN OTP
        ↓
5  ⚠️ BOTH LAND ON THE SAME SCREEN — ONE OF THE THREE QUESTIONS, DRAWN AT RANDOM
        ↓
6  ⚠️ THE USER ANSWERS IT AND IS IN
        ↓        ⚠️ or
7  ⚠️⚠️ THREE WRONG ANSWERS AND THE ACCOUNT IS LOCKED
        ↓
8  ⚠️ THE LOCKED SCREEN SHOWS THE V.A.I. AND ONE BUTTON
        ↓        ⚠️⚠️ REACHABLE WITHOUT SIGNING IN
9  ⚠️⚠️ CHAINPASS RE-VERIFIES AUTOMATICALLY
             ⚠️ Nobody is asked. Nothing pends. The two-date test decides
             in-house or a fresh provider run — `CANON-CP-01` §10.2.
```

## 1.1 — ⚠️⚠️ THE ONLY WAY BACK

⚠️⚠️ **NOTHING ELSE OPENS A LOCKED ACCOUNT. NO ADMINISTRATOR, NO SUPPORT, NO OTP, NO
RECOVERY CODE, NO SECOND FACE SCAN.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE LOCK IS ENFORCED IN THE DATABASE. `cleared_by` CAN ONLY EVER READ `chainpass_reverification`. ANY OTHER VALUE FAILS, EVEN WITH FULL PRIVILEGES.** |
| 2 | ⚠️⚠️ **AN ADMINISTRATOR CANNOT UNLOCK AN ACCOUNT. NOT WILL NOT — CANNOT.** |
| 3 | ⚠️ **Most account takeovers are not technical. They are someone convincing support the account is locked.** ⚠️⚠️ **THERE IS NOBODY TO CONVINCE.** |
| 4 | ⚠️ **Custody is ChainPass's** — `RULINGS-VA-05` §1. **The questions and the one-time passwords are set on the ChainPass retrieval page and stored there.** |

## 1.2 — THE COPY

| # | |
|---|---|
| 1 | ⚠️ **A failure is a camera problem.** Light, angle, glasses, an ageing baseline. |
| 2 | ⚠️⚠️ **NEVER A JUDGEMENT ABOUT THE USER.** |
| 3 | ⚠️ **"Attempt N of the cap." ❌ Never "attempt 1 of 3."** |
| 4 | ⚠️ **At a re-baseline: "we need a new photo." ❌ Never "verification failed."** |

---

# 2 — SYSTEM-WIDE FAILURE

⚠️ **The facial stack is down.**

```
1  ⚠️⚠️ CHAINPASS DECLARES IT
        ↓        ⚠️ One health signal, one answer, naming which subsystem is down —
        ↓        the matcher, the image serve, or both.
2  ⚠️ THE DOOR BECOMES THE V.A.I. PLUS ONE QUESTION, DRAWN AT RANDOM
        ↓        ⚠️ Fetched from ChainPass — custody is ChainPass's.
3  ⚠️ EVERY BINDING ACTION CARRIES A NOTICE ON THE ACTION ITSELF
        ↓        ⚠️⚠️ NEVER A STATUS PAGE. THE NOTICE GOES WHERE THE DECISION IS.
4  ⚠️ IN PERSON, MANUAL VERIFICATION RUNS AS NORMAL
        ↓
5  ⚠️⚠️ ONLINE, MANUAL IS MUTUAL
        ↓        ⚠️ Both parties agree, then each sees the other's photograph.
        ↓        ⚠️⚠️ BOTH WAYS, NEVER ONE-SIDED. THAT IS THE ONLY WAY MANUAL
        ↓        IS SERVED ONLINE.
6  ⚠️ VAIRIFY RENDERS IT AND STORES NOTHING
        ↓
7  ⚠️ ANY USER WHO CANNOT VERIFY GOES BACK TO CHAINPASS
```

## 2.1 — ⚠️⚠️ VAIRIFY NEVER INFERS AN OUTAGE

⚠️⚠️ **CONSECUTIVE FAILURES ARE NOT A SIGNAL. AN OUTAGE IS DECLARED OR IT IS NOT
HAPPENING.**

⚠️ **That inference is what masked 400s as 503s and let a field-name bug survive for weeks.
A system that diagnoses itself from symptoms will diagnose itself wrong.**

## 2.2 — ⚠️⚠️ THE IMAGE SERVE SHIPS SEPARATELY FROM THE MATCHER

⚠️ **A comparison needs an engine. Serving a file does not.**

⚠️⚠️ **IF THEY SHIP TOGETHER, THE MATCHER GOING DOWN TAKES THE PHOTOGRAPH WITH IT — AND THE
MANUAL FALLBACK DIES WITH THE THING IT IS A FALLBACK FOR.**

## 2.3 — ⚠️ NO FALLBACK DOOR FOR CHAINPASS BEING DOWN ENTIRE

⚠️ **Entry is ChainPass's function on every platform. It is one system.**

❌ ⚠️⚠️ **A PLATFORM IMPROVISING AN EXPLANATION FOR A SUPPLIER'S OUTAGE IS FORBIDDEN** —
`CANON-CP-01` §SUPPLIER OBLIGATIONS item 3.

---

# 3 — WHAT THIS CHANGES AT SOURCE

| # | Target | Change |
|---|---|---|
| 1 | `CANON-MI-22` §6–§15 | **Superseded by §1 and §2 of this file.** |
| 2 | `CANON-MI-25` §2, §3, §4 | **Custody is ChainPass's; the sequence is §1 here.** |
| 3 | `CANON-00` §7 | ⚠️⚠️ **THE PRONOUN RULE JOINS THE BANNED-WORDS TABLE.** |
| 4 | Every canon file, screen and brief | ⚠️⚠️ **PRONOUN SWEEP OWED. `DESIGN-BRIEF-CP-01` CARRIES NINE.** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. Both recovery paths as one official sequence. | The two paths were spread across `CANON-MI-22`, `CANON-MI-25` and three rulings, and had been restated five times because no single file held them. |
| **25 Aug** | 2 | §0 — user, provider, client. Never a pronoun. | ⚠️⚠️ **`CANON-00` FORBADE THE PROTOCOL ENCODING ROLES BUT NOT THE PROSE. THE PROSE IS WHERE IT KEPT SLIPPING, AND A BRIEF THAT ASSIGNS A GENDER HANDS A DESIGNER THE ASSUMPTION BEFORE A SCREEN IS DRAWN.** |
| **25 Aug** | 3 | §1.1 — the lock is a database constraint, restated with its reasoning. | ⚠️ **The value is not that support refuses. It is that there is no support to ask.** |
| **25 Aug** | 4 | §2.2 — the image serve ships separately, with the reason. | ⚠️⚠️ **A FALLBACK DEPLOYED ALONGSIDE THE THING IT REPLACES IS NOT A FALLBACK.** |

---

⚠️⚠️ **`CANON-MI-36` §2 step 1 is now buildable** — `RULINGS-CP-05`. The two recovery
paths stay as written. A user-requested re-baseline is a third route the user chooses
and a locked account does not use — `RULINGS-CP-06`.
