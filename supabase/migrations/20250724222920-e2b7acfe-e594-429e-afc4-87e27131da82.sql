-- Create client_notes table for CEO call notes and interactions
CREATE TABLE public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  follow_up_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_interactions table for call history
CREATE TABLE public.client_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_by UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follow_ups table for reminder system
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  related_note_id UUID,
  related_interaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies for client_notes
CREATE POLICY "Admins can manage all client notes" 
ON public.client_notes 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create policies for client_interactions
CREATE POLICY "Admins can manage all client interactions" 
ON public.client_interactions 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create policies for follow_ups
CREATE POLICY "Admins can manage all follow ups" 
ON public.follow_ups 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_client_notes_updated_at
BEFORE UPDATE ON public.client_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_interactions_updated_at
BEFORE UPDATE ON public.client_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at
BEFORE UPDATE ON public.follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_client_notes_user_id ON public.client_notes(user_id);
CREATE INDEX idx_client_notes_created_by ON public.client_notes(created_by);
CREATE INDEX idx_client_notes_follow_up_date ON public.client_notes(follow_up_date);

CREATE INDEX idx_client_interactions_user_id ON public.client_interactions(user_id);
CREATE INDEX idx_client_interactions_created_by ON public.client_interactions(created_by);
CREATE INDEX idx_client_interactions_type ON public.client_interactions(interaction_type);

CREATE INDEX idx_follow_ups_user_id ON public.follow_ups(user_id);
CREATE INDEX idx_follow_ups_due_date ON public.follow_ups(due_date);
CREATE INDEX idx_follow_ups_status ON public.follow_ups(status);