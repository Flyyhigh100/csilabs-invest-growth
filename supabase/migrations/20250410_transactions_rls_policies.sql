
-- Enable Row Level Security on the transactions table if not already enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to select only their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions" 
  ON public.transactions 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());

-- Create policy for admins to update transactions
CREATE POLICY "Admins can update transactions" 
  ON public.transactions 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin());

-- Create policy for service role to insert transactions (webhooks)
CREATE POLICY "Service role can insert transactions" 
  ON public.transactions 
  FOR INSERT 
  TO service_role;

-- Create policy for service role to update transactions (webhooks)
CREATE POLICY "Service role can update transactions" 
  ON public.transactions 
  FOR UPDATE 
  TO service_role;
