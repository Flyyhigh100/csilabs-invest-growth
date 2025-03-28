
-- Add fields for CoinPayments integration to the transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS external_transaction_id text,
ADD COLUMN IF NOT EXISTS payment_data jsonb;
