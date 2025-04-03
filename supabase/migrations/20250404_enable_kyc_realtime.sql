
-- Enable replica identity for the kyc_verifications table
ALTER TABLE public.kyc_verifications REPLICA IDENTITY FULL;

-- Create the supabase_realtime publication if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

-- Add the kyc_verifications table to the supabase_realtime publication
-- Remove it first if it already exists to avoid errors
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.kyc_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_verifications;

-- Log that the realtime has been enabled
DO $$
BEGIN
    RAISE NOTICE 'Realtime enabled for kyc_verifications table';
END
$$;
