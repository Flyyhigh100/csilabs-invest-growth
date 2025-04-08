
-- Create function to create notifications
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

-- Create function to retrieve notifications for a user
CREATE OR REPLACE FUNCTION public.get_user_notifications()
RETURNS SETOF public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.notifications
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC
    LIMIT 20;
END;
$$;

-- Create function to mark a notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET read = true
    WHERE id = notification_id
    AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security check to ensure users can only mark their own notifications as read
    IF auth.uid() <> user_id_param THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.notifications
    SET read = true
    WHERE user_id = user_id_param;
    
    RETURN TRUE;
END;
$$;
