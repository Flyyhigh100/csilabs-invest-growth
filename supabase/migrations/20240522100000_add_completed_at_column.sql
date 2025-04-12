-- Add the completed_at column to track when a transaction was finalized
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS completed_at timestamptz NULL;

-- Optional: Add an index for potentially faster lookups on completed transactions
CREATE INDEX IF NOT EXISTS idx_transactions_completed_at ON public.transactions (completed_at); 