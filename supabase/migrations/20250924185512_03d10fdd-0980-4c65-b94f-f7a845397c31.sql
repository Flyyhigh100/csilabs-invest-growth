-- Create user legacy asset transactions table
CREATE TABLE public.user_legacy_asset_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'transfer_in', 'transfer_out')),
  transaction_date DATE NOT NULL,
  shares_quantity NUMERIC NOT NULL CHECK (shares_quantity > 0),
  price_per_share NUMERIC NOT NULL CHECK (price_per_share > 0),
  total_value NUMERIC GENERATED ALWAYS AS (shares_quantity * price_per_share) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_legacy_asset_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own legacy asset transactions"
ON public.user_legacy_asset_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legacy asset transactions"
ON public.user_legacy_asset_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legacy asset transactions"
ON public.user_legacy_asset_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legacy asset transactions"
ON public.user_legacy_asset_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all legacy asset transactions"
ON public.user_legacy_asset_transactions
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage all legacy asset transactions"
ON public.user_legacy_asset_transactions
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_legacy_asset_transactions_updated_at
BEFORE UPDATE ON public.user_legacy_asset_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient queries
CREATE INDEX idx_user_legacy_asset_transactions_user_asset 
ON public.user_legacy_asset_transactions(user_id, asset_type);

CREATE INDEX idx_user_legacy_asset_transactions_date 
ON public.user_legacy_asset_transactions(transaction_date DESC);