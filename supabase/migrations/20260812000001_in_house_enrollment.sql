-- In-house enrollment support for one-month soft launch

-- Make ComplyCube fields nullable (not required for provisional credentials)
alter table credentials
  alter column complycube_client_id drop not null,
  alter column document_expiry drop not null,
  alter column next_complycube_date drop not null;

-- Add provisional flag to distinguish in-house from ComplyCube-verified credentials
alter table credentials
  add column provisional boolean not null default false;

-- Allow in-house enrollment as a baseline source
alter table baselines
  drop constraint baselines_source_check,
  add constraint baselines_source_check
    check (source in ('complycube', 'in_house'));
