-- Add expiration to transaction numbers (stored in verification_records.complycube_verification_id)
ALTER TABLE public.verification_records 
ADD COLUMN IF NOT EXISTS transaction_expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have expiration (7 days from creation)
UPDATE public.verification_records 
SET transaction_expires_at = created_at + INTERVAL '7 days'
WHERE transaction_expires_at IS NULL 
  AND complycube_verification_id IS NOT NULL;

-- Set default expiration for new records (7 days from creation)
-- Note: We'll use a trigger to set this automatically
CREATE OR REPLACE FUNCTION set_transaction_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiration to 7 days from creation if transaction number exists
  IF NEW.complycube_verification_id IS NOT NULL AND NEW.transaction_expires_at IS NULL THEN
    NEW.transaction_expires_at := NEW.created_at + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set expiration on insert
DROP TRIGGER IF EXISTS trigger_set_transaction_expiration ON public.verification_records;
CREATE TRIGGER trigger_set_transaction_expiration
  BEFORE INSERT ON public.verification_records
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_expiration();

-- Create index for expiration queries
CREATE INDEX IF NOT EXISTS idx_verification_records_transaction_expires_at 
ON public.verification_records(transaction_expires_at) 
WHERE transaction_expires_at IS NOT NULL;

-- Create function to delete expired transaction numbers
CREATE OR REPLACE FUNCTION delete_expired_transactions()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  deleted_rows BIGINT;
BEGIN
  -- Delete complycube_verification_id for expired records (set to NULL, don't delete the record)
  -- This preserves the verification record but removes the transaction number
  UPDATE public.verification_records
  SET complycube_verification_id = NULL,
      transaction_expires_at = NULL
  WHERE transaction_expires_at < NOW()
    AND complycube_verification_id IS NOT NULL;
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  -- Log deletion count
  RAISE NOTICE 'Cleaned up % expired transaction numbers', deleted_rows;
  
  RETURN QUERY SELECT deleted_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON COLUMN public.verification_records.transaction_expires_at IS 'Expiration date for transaction number (7 days from creation). Transaction numbers are automatically removed after expiration for privacy compliance.';
COMMENT ON FUNCTION delete_expired_transactions() IS 'Cleans up expired transaction numbers by setting complycube_verification_id to NULL for records where transaction_expires_at has passed.';

-- Note: pg_cron job must be scheduled manually in Supabase Dashboard
-- To schedule the cleanup job, run this SQL in Supabase SQL Editor:
-- 
-- SELECT cron.schedule(
--   'delete-expired-transactions',
--   '0 2 * * *',  -- 2 AM daily (UTC)
--   'SELECT delete_expired_transactions();'
-- );
--
-- To verify the schedule:
-- SELECT * FROM cron.job WHERE jobname = 'delete-expired-transactions';
--
-- To unschedule:
-- SELECT cron.unschedule('delete-expired-transactions');



