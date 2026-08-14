-- Add affirmation_version to requirement_completions
-- A face capture proves presence; the affirmation proves assent.
-- Together they form a signature.

alter table requirement_completions
  add column affirmation_version text not null default '';
