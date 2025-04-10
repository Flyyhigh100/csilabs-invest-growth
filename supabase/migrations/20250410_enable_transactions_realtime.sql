
-- Enable replica identity for the transactions table to support realtime
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Add the transactions table to the realtime publication
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'transactions') 
ON CONFLICT DO NOTHING;
