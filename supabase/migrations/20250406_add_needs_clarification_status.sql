
-- Add 'needs_clarification' to the kyc_status enum
ALTER TYPE public.kyc_status ADD VALUE IF NOT EXISTS 'needs_clarification';

-- Update the realtime configuration for kyc_verifications if not already done
ALTER TABLE public.kyc_verifications REPLICA IDENTITY FULL;
