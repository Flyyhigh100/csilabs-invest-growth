
-- Add blockchain_tx_id column to transactions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'blockchain_tx_id'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN blockchain_tx_id TEXT;
  END IF;
END $$;

-- Enable row level security on the transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own transactions
CREATE POLICY IF NOT EXISTS "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Add the transactions table to realtime publication for live updates
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Add transactions table to the realtime publication if it doesn't exist
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'transactions')
ON CONFLICT DO NOTHING;
