
-- This migration fixes the real-time configuration for the transactions table
-- First, explicitly set REPLICA IDENTITY to FULL
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Then add the transactions table to the supabase_realtime publication
-- First check if the publication exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add the transactions table to the publication if not already added
SELECT pg_catalog.pg_publication_tables
WHERE EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'transactions'
);

-- If not in the publication, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'transactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    END IF;
END $$;
