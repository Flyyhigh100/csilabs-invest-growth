
-- Create a table for storing user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('wallet', 'payment', 'kyc', 'tokens', 'other')),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable row level security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Setup function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
    _user_id UUID,
    _title TEXT,
    _message TEXT,
    _type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (_user_id, _title, _message, _type)
    RETURNING id INTO _notification_id;
    
    RETURN _notification_id;
END;
$$;

-- Create triggers for common events that should generate notifications

-- 1. KYC status change trigger
CREATE OR REPLACE FUNCTION public.notify_kyc_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _title TEXT;
    _message TEXT;
BEGIN
    -- Only create notification if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'approved' THEN
                _title := 'KYC Verification Approved';
                _message := 'Your identity verification has been successfully approved.';
            WHEN 'rejected' THEN
                _title := 'KYC Verification Rejected';
                _message := 'Your identity verification was rejected. Please check the dashboard for details.';
            WHEN 'pending' THEN
                _title := 'KYC Verification Submitted';
                _message := 'Your identity verification has been submitted and is under review.';
            WHEN 'needs_clarification' THEN
                _title := 'KYC Needs Additional Information';
                _message := 'We need additional information for your identity verification.';
            ELSE
                _title := 'KYC Status Updated';
                _message := 'Your identity verification status has been updated.';
        END CASE;
        
        PERFORM public.create_notification(
            NEW.user_id,
            _title,
            _message,
            'kyc'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER kyc_status_change_notification
AFTER UPDATE ON public.kyc_verifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_kyc_status_change();

-- 2. Wallet address update trigger
CREATE OR REPLACE FUNCTION public.notify_wallet_address_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if wallet_address was added or changed
    IF (OLD.wallet_address IS NULL AND NEW.wallet_address IS NOT NULL) OR 
       (OLD.wallet_address IS DISTINCT FROM NEW.wallet_address AND NEW.wallet_address IS NOT NULL) THEN
        PERFORM public.create_notification(
            NEW.id,
            'Wallet Address Updated',
            'Your wallet address has been successfully updated.',
            'wallet'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER wallet_address_change_notification
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_wallet_address_change();

-- 3. Payment status change trigger
CREATE OR REPLACE FUNCTION public.notify_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _title TEXT;
    _message TEXT;
    _user_id UUID;
BEGIN
    -- Get the user_id from the transaction
    SELECT user_id INTO _user_id FROM public.transactions WHERE id = NEW.id;
    
    -- Only create notification if status changed to completed or failed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'completed' THEN
                _title := 'Payment Completed';
                _message := format('Your payment of $%s has been successfully processed.', NEW.amount);
            WHEN 'failed' THEN
                _title := 'Payment Failed';
                _message := format('Your payment of $%s has failed. Please check the dashboard for details.', NEW.amount);
            ELSE
                -- Don't create notifications for other status changes
                RETURN NEW;
        END CASE;
        
        PERFORM public.create_notification(
            _user_id,
            _title,
            _message,
            'payment'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER payment_status_change_notification
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.notify_payment_status_change();

-- 4. Token delivery notification (this would connect to your token delivery system)
-- This is a placeholder - you would connect this to your actual token delivery process
CREATE OR REPLACE FUNCTION public.notify_token_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This assumes you have a tokens_delivered table or similar
    -- Adjust according to your actual schema
    PERFORM public.create_notification(
        NEW.user_id,
        'Tokens Delivered',
        format('Your tokens have been delivered to your wallet. Amount: %s CSI', NEW.token_amount),
        'tokens'
    );
    
    RETURN NEW;
END;
$$;

-- You would create a trigger on your token delivery table
-- This is a placeholder - uncomment and adjust when you have the actual table
-- CREATE TRIGGER token_delivery_notification
-- AFTER INSERT ON public.token_deliveries
-- FOR EACH ROW
-- EXECUTE FUNCTION public.notify_token_delivery();
