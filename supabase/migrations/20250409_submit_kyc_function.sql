
-- This migration is no longer used as we're doing direct updates instead of RPC calls
-- Keeping as a placeholder for reference

-- Comment out the function as we're not using it anymore
/*
CREATE OR REPLACE FUNCTION public.submit_kyc_verification(user_id_param UUID, current_time TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has permission to update this record
  IF auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'You can only submit your own KYC verification';
    RETURN FALSE;
  END IF;

  -- Update the KYC verification status and set submission timestamp
  UPDATE public.kyc_verifications 
  SET 
    status = 'pending',
    submitted_at = current_time,
    updated_at = now()
  WHERE 
    user_id = user_id_param;

  -- If update affected any rows, return true
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.submit_kyc_verification IS 'Submit KYC verification with proper status updating, managing permissions and timestamps';

-- Grant execute permission for authenticated users
GRANT EXECUTE ON FUNCTION public.submit_kyc_verification TO authenticated;
*/

-- Instead, make sure users have the appropriate permissions via RLS policies
-- These policies were added in a separate migration
