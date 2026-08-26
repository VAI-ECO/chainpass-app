# RULINGS-CP-06 — THE RE-BASELINE REQUEST

**Owner ruling, 25 August 2026. A user may ask for a new baseline photograph without waiting
to be forced into one, and a platform may place that request anywhere on its own surface.**

⚠️⚠️ **AMENDS `CANON-CP-01` §9.1, §10 AND §14.6.**

---

# 1 — THE RULING

⚠️⚠️ **A USER WHOSE FACE KEEPS FAILING MAY REQUEST A RETAKE. IT IS NOT A FAVOUR AND IT IS
NOT AN EXCEPTION — IT IS A CONTROL THE USER HOLDS.**

| # | |
|---|---|
| 1 | ⚠️ **Faces change. Weight, age, surgery, injury, illness, a beard, a burn.** |
| 2 | ⚠️⚠️ **WITHOUT THIS, THE ONLY ROUTE TO A NEW BASELINE IS TO KEEP FAILING UNTIL THE LIFETIME RED COUNT TRIPS. THAT MAKES A USER GRIND THROUGH FAILURES TO REACH A FIX WE ALREADY KNOW IS NEEDED.** |
| 3 | ⚠️ **The copy never reads as failure.** ✅ *"Update your photo."* ❌ *"Your verification is failing."* |

---

# 2 — ⚠️⚠️ IT IS ALWAYS A FRESH PROVIDER RUN

⚠️⚠️ **A USER-REQUESTED RE-BASELINE NEVER RUNS IN-HOUSE. THE TWO-DATE TEST DOES NOT APPLY
TO IT.**

| # | Why |
|---|---|
| 1 | ⚠️⚠️ **IN-HOUSE MEANS MATCHING THE NEW FACE AGAINST THE HELD BASELINE. THE HELD BASELINE IS THE THING THAT IS NOT WORKING. IT CANNOT AUTHORISE ITS OWN REPLACEMENT.** |
| 2 | ⚠️⚠️ **A RE-BASELINE REPLACES THE FACE ON A CREDENTIAL. IF ANYTHING SHORT OF DOCUMENT-AND-LIVENESS COULD TRIGGER IT, ANYONE HOLDING THE PHONE COULD MAKE THE CREDENTIAL THEIRS, PERMANENTLY.** |
| 3 | ⚠️ **The document re-anchors identity to something the old face cannot vouch for.** |
| 4 | ⚠️ **`CANON-CP-01` §10.2's two-date test still governs the FORCED re-baseline at the red threshold.** ⚠️⚠️ **THE TWO TRIGGERS ARE DIFFERENT AND RUN DIFFERENTLY.** |

| Trigger | Route |
|---|---|
| **Lifetime red count trips** | ⚠️ **Two-date test — in-house or provider** |
| ⚠️⚠️ **USER REQUESTS IT** | ⚠️⚠️ **ALWAYS THE PROVIDER** |

---

# 3 — THE SEQUENCE

```
1  ⚠️ THE USER ASKS                       from anywhere the platform put it
        ↓
2  ⚠️ THE PLATFORM CALLS CHAINPASS        its key + the V.A.I. it holds
        ↓
3  ⚠️ CHAINPASS RETURNS A SIGNED TOKEN    ⚠️⚠️ NO IDENTIFIER ON ANY URL
        ↓
4  ⚠️⚠️ THE USER LANDS ON CHAINPASS       ChainPass screens. The platform is out.
        ↓
5  ⚠️ BOTH CHANNELS ARE NOTIFIED          email and phone. Immediately.
        ↓
6  ⚠️⚠️ THE PROVIDER RUNS                 document + liveness, one camera session
        ↓        ⚠️ ChainPass captures its own frame at the same instant — §2.7
7  ⚠️ DUPLICATE DETECTION RETURNS THE SAME SESSION KEY
        ↓
8  ⚠️⚠️ THE NEW BASELINE IS APPENDED      the old one is not deleted
        ↓
9  ⚠️ THE USER RETURNS TO THE PLATFORM    same V.A.I. Same history. Same agreements.
```

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE NEW BASELINE IS LIVE IMMEDIATELY.** ⚠️ **The provider run is the proof. A waiting period would leave the user locked out of the thing just fixed.** |
| 2 | ⚠️⚠️ **BOTH CHANNELS ARE NOTIFIED AT STEP 5, BEFORE ANYTHING CHANGES, NOT AFTER.** ⚠️ **If someone else started it, the user learns while it can still be stopped.** |
| 3 | ⚠️ **A failed or abandoned run changes nothing. The old baseline stays live.** |
| 4 | ⚠️ **The V.A.I., the agreements, the reviews and the history are untouched** — `SPEC-CP-02` §9 item 3. ⚠️⚠️ **DO NOT BUILD AN INVALIDATION PATH.** |

---

# 4 — LIMITS

| # | |
|---|---|
| 1 | ⚠️⚠️ **A CAP PER PERIOD. A SETTING, ADMIN-ADJUSTABLE, NEVER A CONSTANT.** ⚠️ **Uncapped, this is a free channel into the provider at ChainPass's cost.** |
| 2 | ⚠️ **Hitting the cap does not lock the account.** ⚠️⚠️ **IT ROUTES TO CHAINPASS SUPPORT, NOT TO A DEAD END.** |
| 3 | ⚠️⚠️ **A LOCKED ACCOUNT DOES NOT USE THIS PATH. A LOCK'S ONLY ROUTE IS THE AUTOMATIC RE-VERIFICATION — `CANON-MI-36` §1.1. SAME MACHINERY, DIFFERENT TRIGGER, AND THE LOCKED ONE IS NOT OPTIONAL.** |
| 4 | ⬜ **Whether the user pays.** ⚠️ **A forced re-baseline is on ChainPass — §9.1 item 3. A requested one is not ruled. UNRULED, NOT INVENTED.** |

---

# 5 — THE PLATFORM API

⚠️⚠️ **A PLATFORM PUTS THE REQUEST WHEREVER IT WANTS — A SETTINGS PAGE, A HELP PAGE, A
FAILURE SCREEN, A SUPPORT REPLY. CHAINPASS DOES NOT DICTATE THE PLACEMENT.**

| # | |
|---|---|
| 1 | **The platform calls one endpoint with its key and a V.A.I., and receives a signed token and a URL.** |
| 2 | ⚠️⚠️ **SCOPED TO ITS OWN KEY AND TO A V.A.I. IT WAS HANDED. A PLATFORM CANNOT OPEN A RE-BASELINE FOR A NUMBER IT DOES NOT HOLD.** |
| 3 | ⚠️⚠️ **THE CALL OPENS A SESSION. IT DOES NOT PERFORM A RE-BASELINE. ONLY THE USER, IN FRONT OF THE PROVIDER, CAN DO THAT.** |
| 4 | ⚠️ **Short-lived token. Single use.** |
| 5 | ⚠️⚠️ **THE RESPONSE CARRIES NO STATE ABOUT THE USER — NOT WHETHER THE USER HAS FAILED, NOT HOW OFTEN, NOT HOW MANY RETAKES REMAIN.** ⚠️ **A platform is never told why a credential is not active, and this is the same rule** — `CANON-CP-01` §4B.3. |
| 6 | ⚠️ **A refusal — cap reached, locked, unknown V.A.I. — returns one word. Never a reason about the person.** |

---

# 6 — WHAT THIS CHANGES AT SOURCE

| # | Target | Change |
|---|---|---|
| 1 | `CANON-CP-01` §9.1 | **A fourth trigger for a fresh KYC run: the user asked.** |
| 2 | `CANON-CP-01` §10 | ⚠️⚠️ **THE TWO-DATE TEST APPLIES TO THE FORCED RE-BASELINE ONLY. A REQUESTED ONE IS ALWAYS THE PROVIDER.** |
| 3 | `CANON-CP-01` §14.6 | **Gains a re-baseline surface — open a session, and nothing else.** |
| 4 | `CANON-CP-01` §14.7 | **The master dashboard gains the per-period cap as an admin field, and a log of requested re-baselines.** |
| 5 | `CANON-MI-36` §1 | ⚠️ **The two paths stay as written.** ⚠️⚠️ **THIS IS A THIRD ROUTE THAT AVOIDS BOTH, AND IT IS THE ONLY ONE THE USER CHOOSES.** |

---

# 7 — ⬜ OPEN

| # | | Whose |
|---|---|---|
| 1 | ⚠️⚠️ **DOES THE USER PAY FOR A REQUESTED RE-BASELINE?** ⚠️ **Free is kind and is an open cost. Charged is defensible and is hostile to someone whose face changed through no fault of theirs.** | Owner |
| 2 | **The cap and the period — the actual numbers.** ⚠️ **Settings. UNSET until measured.** | Pilot |
| 3 | ⬜ **Does the platform learn the re-baseline completed, or only see the credential work again?** ⚠️ **Silence is consistent with §5 item 5.** | Owner |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. | Without it, the only route to a new baseline is to keep failing until the lifetime count trips. That makes a user grind through failures to reach a fix we already know is needed. |
| **25 Aug** | 2 | §2 — a requested re-baseline is always a fresh provider run. | ⚠️⚠️ **IN-HOUSE MEANS MATCHING AGAINST THE BASELINE THAT IS NOT WORKING. IT CANNOT AUTHORISE ITS OWN REPLACEMENT, AND ANYTHING SHORT OF DOCUMENT-AND-LIVENESS WOULD LET WHOEVER HOLDS THE PHONE TAKE THE CREDENTIAL PERMANENTLY.** |
| **25 Aug** | 3 | §3 item 2 — both channels notified before anything changes. | ⚠️ **If someone else started it, the user learns while it can still be stopped.** |
| **25 Aug** | 4 | §5 item 3 — the API opens a session and never performs the act. | ⚠️⚠️ **A PLATFORM THAT COULD TRIGGER A RE-BASELINE COULD REPLACE A FACE. IT REQUESTS A DOOR; THE USER WALKS THROUGH IT.** |
| **25 Aug** | 5 | §5 item 5 — the response carries no state about the user. | ⚠️ **"Two retakes remaining" tells a platform how often that person has been failing, which is exactly what §4B.3 keeps from them.** |
| **25 Aug** | 6 | §4 item 4 — payment left unruled. | ⚠️⚠️ **THE OWNER DID NOT SAY IT. NOTHING IS INVENTED.** |

---

**Deposited 25 August 2026 to `chainpass-app/docs/canon/`.**
