
-- First check if replica identity is already set to FULL
DO $$
BEGIN
    -- Check current replica identity setting
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
        AND c.relname = 'transactions'
        AND c.relreplident = 'f'
    ) THEN
        -- Set replica identity to FULL if not already set
        ALTER TABLE public.transactions REPLICA IDENTITY FULL;
    END IF;
END $$;

-- Ensure transactions table is included in realtime publication
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'transactions') 
ON CONFLICT DO NOTHING;
