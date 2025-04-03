
-- Enable replica identity for the kyc_verifications table
ALTER TABLE public.kyc_verifications REPLICA IDENTITY FULL;

-- Add the kyc_verifications table to the supabase_realtime publication if it exists
SELECT pg_catalog.pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- If the publication doesn't exist yet, create it
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
ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_verifications;
