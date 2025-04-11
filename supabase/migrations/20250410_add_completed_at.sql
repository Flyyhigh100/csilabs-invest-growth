
-- Add completed_at timestamp to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Make sure migrations are enabled in realtime
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'transactions') 
ON CONFLICT DO NOTHING;
