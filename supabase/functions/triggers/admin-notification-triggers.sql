
-- Create a trigger function to notify admins when a KYC verification is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_kyc_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only trigger when status changes to 'pending'
    IF NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status <> 'pending') THEN
        -- Call our edge function with a fixed API key
        PERFORM
            net.http_post(
                url:='https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/admin-notifications',
                headers:=jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaHZsaXFrbWV0Y2RwaG5ldHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzAxMjcsImV4cCI6MjA1ODc0NjEyN30.n4mncbTJGzcPdEl0RqPFMo_UGOZI6D-GolKqFH6GJug'
                ),
                body:=jsonb_build_object(
                    'event', 'kyc_submitted',
                    'data', jsonb_build_object(
                        'user_id', NEW.user_id,
                        'kyc_id', NEW.id,
                        'submitted_at', NEW.submitted_at
                    )
                )
            );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create a trigger for KYC notifications
DROP TRIGGER IF EXISTS on_kyc_status_change ON public.kyc_verifications;
CREATE TRIGGER on_kyc_status_change
    AFTER INSERT OR UPDATE OF status ON public.kyc_verifications
    FOR EACH ROW EXECUTE FUNCTION public.notify_admins_kyc_pending();

-- Create a trigger function to notify admins when a transaction completes but tokens haven't been sent
CREATE OR REPLACE FUNCTION public.notify_admins_transaction_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only trigger when status changes to 'completed' and token_sent is false
    IF NEW.status = 'completed' AND NEW.token_sent = false AND 
       (OLD.status IS NULL OR OLD.status <> 'completed' OR OLD.token_sent = true) THEN
        -- Call our edge function
        PERFORM
            net.http_post(
                url:='https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/admin-notifications',
                headers:=jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaHZsaXFrbWV0Y2RwaG5ldHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzAxMjcsImV4cCI6MjA1ODc0NjEyN30.n4mncbTJGzcPdEl0RqPFMo_UGOZI6D-GolKqFH6GJug'
                ),
                body:=jsonb_build_object(
                    'event', 'transaction_completed',
                    'data', jsonb_build_object(
                        'user_id', NEW.user_id,
                        'transaction_id', NEW.id,
                        'amount', NEW.amount,
                        'completed_at', NEW.completed_at
                    )
                )
            );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create a trigger for transaction notifications
DROP TRIGGER IF EXISTS on_transaction_completed ON public.transactions;
CREATE TRIGGER on_transaction_completed
    AFTER INSERT OR UPDATE OF status, token_sent ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.notify_admins_transaction_completed();
