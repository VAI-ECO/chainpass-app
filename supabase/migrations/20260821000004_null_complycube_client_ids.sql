-- Stage (c): null every stored provider client id on credentials.
UPDATE public.credentials
SET complycube_client_id = NULL
WHERE complycube_client_id IS NOT NULL;
