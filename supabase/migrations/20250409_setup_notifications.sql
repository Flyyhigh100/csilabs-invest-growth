
-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable row level security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own notifications (mark as read)
CREATE POLICY IF NOT EXISTS "Users can update their own notifications" 
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Setup realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add notifications table to the realtime publication
INSERT INTO supabase_realtime.subscription (publication, name)
VALUES ('supabase_realtime', 'notifications')
ON CONFLICT DO NOTHING;
