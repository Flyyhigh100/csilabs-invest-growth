
-- Create function to get a secret by name
CREATE OR REPLACE FUNCTION public.get_secret(secret_name text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    secret_value text;
BEGIN
    -- Check if the user has admin privileges
    IF (SELECT is_admin() FROM is_admin()) THEN
        -- Select secret value by name
        SELECT value INTO secret_value
        FROM public.secrets
        WHERE name = secret_name;
        
        RETURN secret_value;
    ELSE
        -- Only return specific secrets for regular users 
        -- (In this case only MORALIS_API_KEY to avoid extra edge function call)
        IF secret_name = 'MORALIS_API_KEY' THEN
            SELECT value INTO secret_value
            FROM public.secrets
            WHERE name = secret_name;
            
            RETURN secret_value;
        ELSE
            RETURN NULL;
        END IF;
    END IF;
END;
$$;

-- Create secrets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.secrets (
    name text PRIMARY KEY,
    value text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add RLS to prevent direct table access
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Only admins can access secrets directly
CREATE POLICY "Only admins can access secrets" 
ON public.secrets 
USING (is_admin());
