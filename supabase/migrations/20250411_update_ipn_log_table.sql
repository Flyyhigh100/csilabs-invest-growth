
-- Add new columns for enhanced IPN logging
ALTER TABLE public.ipn_logs 
  ADD COLUMN IF NOT EXISTS verification_status TEXT,
  ADD COLUMN IF NOT EXISTS processing_status TEXT,
  ADD COLUMN IF NOT EXISTS error_category TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS details JSONB,
  ADD COLUMN IF NOT EXISTS source_ip TEXT,
  ADD COLUMN IF NOT EXISTS request_headers TEXT,
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE;

-- Create index on txn_id for faster lookups
CREATE INDEX IF NOT EXISTS ipn_logs_txn_id_idx ON public.ipn_logs (txn_id);

-- Create index on created_at for faster querying by time
CREATE INDEX IF NOT EXISTS ipn_logs_created_at_idx ON public.ipn_logs (created_at);

-- Create index on status for filtering by processing status
CREATE INDEX IF NOT EXISTS ipn_logs_processing_status_idx ON public.ipn_logs (processing_status);

-- Add this table to the realtime subscription if not already there
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'ipn_logs') 
ON CONFLICT DO NOTHING;
