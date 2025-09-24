-- Add audit logging enhancements for legacy assets
-- First, add a reason field to audit_logs for admin change tracking
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS is_admin_action BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance on audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_operation ON public.audit_logs(user_id, operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create a function to automatically audit legacy asset changes
CREATE OR REPLACE FUNCTION public.audit_legacy_asset_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for legacy asset tables
DROP TRIGGER IF EXISTS audit_legacy_assets_changes ON public.user_legacy_assets;
CREATE TRIGGER audit_legacy_assets_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.user_legacy_assets
    FOR EACH ROW EXECUTE FUNCTION public.audit_legacy_asset_changes();

DROP TRIGGER IF EXISTS audit_legacy_asset_transactions_changes ON public.user_legacy_asset_transactions;
CREATE TRIGGER audit_legacy_asset_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.user_legacy_asset_transactions
    FOR EACH ROW EXECUTE FUNCTION public.audit_legacy_asset_changes();

-- Create a function to get legacy asset change history
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_legacy_asset_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_legacy_asset_changes TO authenticated;