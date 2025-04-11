
-- Add additional columns to the ipn_logs table for better IPN tracking
ALTER TABLE public.ipn_logs
ADD COLUMN IF NOT EXISTS verification_status TEXT,
ADD COLUMN IF NOT EXISTS processing_status TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS request_headers JSONB,
ADD COLUMN IF NOT EXISTS source_ip TEXT;
