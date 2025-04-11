
-- Create a table for logging IPN notifications for debugging
CREATE TABLE public.ipn_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  txn_id TEXT,
  status TEXT,
  raw_data JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL,
  response_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.ipn_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to view IPN logs
CREATE POLICY "Only admins can view IPN logs" 
  ON public.ipn_logs 
  FOR SELECT 
  USING (public.is_admin());

-- Update our check-coinpayments-status function to also check IPN status
-- For existing check-coinpayments-status we can improve the status handling:
-- ALTER TABLE public.ipn_logs REPLICA IDENTITY FULL;
