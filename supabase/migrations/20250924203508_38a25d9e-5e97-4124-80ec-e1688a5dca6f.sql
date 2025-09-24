-- Fix security warnings by setting search_path for functions

-- Update the audit_legacy_asset_changes function with proper search_path
CREATE OR REPLACE FUNCTION public.audit_legacy_asset_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id,
            operation,
            table_name,
            record_id,
            new_values,
            created_at
        ) VALUES (
            NEW.user_id,
            'legacy_asset_created',
            TG_TABLE_NAME,
            NEW.id::text,
            row_to_json(NEW),
            now()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id,
            operation,
            table_name,
            record_id,
            old_values,
            new_values,
            created_at
        ) VALUES (
            NEW.user_id,
            'legacy_asset_updated',
            TG_TABLE_NAME,
            NEW.id::text,
            row_to_json(OLD),
            row_to_json(NEW),
            now()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id,
            operation,
            table_name,
            record_id,
            old_values,
            created_at
        ) VALUES (
            OLD.user_id,
            'legacy_asset_deleted',
            TG_TABLE_NAME,
            OLD.id::text,
            row_to_json(OLD),
            now()
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Update the get_legacy_asset_history function with proper search_path
CREATE OR REPLACE FUNCTION public.get_legacy_asset_history(p_user_id UUID, p_asset_type TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    operation TEXT,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    is_admin_action BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    ip_address TEXT
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.operation,
        al.table_name,
        al.record_id,
        al.old_values,
        al.new_values,
        al.reason,
        al.is_admin_action,
        al.created_at,
        al.user_agent,
        al.ip_address
    FROM public.audit_logs al
    WHERE al.user_id = p_user_id
    AND al.table_name IN ('user_legacy_assets', 'user_legacy_asset_transactions')
    AND (p_asset_type IS NULL OR (
        (al.old_values->>'asset_type' = p_asset_type) OR 
        (al.new_values->>'asset_type' = p_asset_type)
    ))
    ORDER BY al.created_at DESC;
END;
$$;