
-- Create a table for logging IPN notifications for debugging
CREATE TABLE public.ipn_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  txn_id TEXT,
  status TEXT,
  raw_data JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL,
  response_status TEXT,
  hmac_header TEXT, -- Store HMAC header for verification debugging
  request_body TEXT, -- Store raw request body for verification debugging
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.ipn_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to view IPN logs
CREATE POLICY "Only admins can view IPN logs" 
  ON public.ipn_logs 
  FOR SELECT 
  USING (public.is_admin());

-- Enable replica identity to support realtime
ALTER TABLE public.ipn_logs REPLICA IDENTITY FULL;

-- Add the ipn_logs table to the realtime publication
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'ipn_logs') 
ON CONFLICT DO NOTHING;
