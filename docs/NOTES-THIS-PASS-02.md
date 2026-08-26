# NOTES-THIS-PASS-02 — CP-PASS-02 26 Aug

Role: Cursor WRITES. Never decides.

- Run 2: `ssh root@2.28.18.138` Permission denied (publickey,password). Face-service hash, MODEL_VERSION line, derive-from-checksum, and `/health` swap not run.
- Run 4: `authenticated` cannot INSERT agreements (42501). Trigger proven as `service_role`. Left fixtures `CP-PASS-02-DRAFT` and `CP-PASS-02-RETIRED`.
- Run 6: `send-to-vairify` and `verify-complycube-biometric` are in config.toml with no `index.ts`. Deploy all failed on those two.
- Run 7: no live enrolment through the thirteen-step order. No live probe (SSH denied).
- VAIRIFY platform row existed without `api_key_hash`. Key generated, hashed, row updated in place. Block size copied from the only live `blocks` row (`cp03walk`, size 100) because `consumption_block_size` is UNSET. Trial verify at levels 1/2/3 all returned `{"status":"trial_approved"}`. Scoped re-baseline without a visit row returned `{"error":"refused"}`. Agreement e2e: `CP-VAIRIFY-E2E-26AUG` then `CP-VAIRIFY-E2E-26AUG2`.
- Exchange: Vairify hosted secrets `CHAINPASS_API_KEY` and `CHAINPASS_SERVICE_KEY` (same key) plus `CHAINPASS_API_URL`; client `VITE_CHAINPASS_SERVICE_KEY` in gitignored `.env`. No in-repo key file. Plaintext is not committed.
