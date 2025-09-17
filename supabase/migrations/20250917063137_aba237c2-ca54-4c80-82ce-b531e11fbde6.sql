-- Create user_legacy_assets table for tracking Cannabis Science legacy holdings
CREATE TABLE public.user_legacy_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_type)
);

-- Enable Row Level Security
ALTER TABLE public.user_legacy_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own legacy assets" 
ON public.user_legacy_assets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legacy assets" 
ON public.user_legacy_assets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legacy assets" 
ON public.user_legacy_assets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legacy assets" 
ON public.user_legacy_assets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin access policies
CREATE POLICY "Admins can view all legacy assets" 
ON public.user_legacy_assets 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage all legacy assets" 
ON public.user_legacy_assets 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_legacy_assets_updated_at
BEFORE UPDATE ON public.user_legacy_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();