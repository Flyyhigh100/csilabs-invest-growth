
-- Alter the kyc_status enum type to include 'needs_clarification'
ALTER TYPE public.kyc_status ADD VALUE 'needs_clarification' IF NOT EXISTS;
