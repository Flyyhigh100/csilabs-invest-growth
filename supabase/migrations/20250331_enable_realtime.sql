
-- Enable full replica identity for the kyc_verifications table
ALTER TABLE public.kyc_verifications REPLICA IDENTITY FULL;

-- Add the kyc_verifications table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_verifications;
