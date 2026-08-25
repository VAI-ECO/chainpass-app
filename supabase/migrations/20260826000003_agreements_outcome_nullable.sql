-- SPEC-CP-02: outcome is set when the agreement closes, not at open.

ALTER TABLE public.agreements
  ALTER COLUMN outcome DROP NOT NULL;
