
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other';
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setHasUnread(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Use a raw query approach since TypeScript doesn't know about our notifications table yet
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Cast the data to our Notification type
      const notificationsData = data as unknown as Notification[];
      setNotifications(notificationsData);
      
      // Check if there are any unread notifications
      const unreadExists = notificationsData.some(notification => !notification.read);
      setHasUnread(unreadExists);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications' as any)
        .update({ read: true } as any)
        .eq('id', notificationId);

      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );

      // Check if we still have unread notifications
      const stillHasUnread = notifications.some(
        notification => notification.id !== notificationId && !notification.read
      );
      setHasUnread(stillHasUnread);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications' as any)
        .update({ read: true } as any)
        .eq('user_id', user.id);

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setHasUnread(false);
      
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchNotifications();

    // Subscribe to new notifications using type assertion for channel name
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          // Cast the new notification to our type
          const newNotification = payload.new as unknown as Notification;
          setNotifications(current => [newNotification, ...current]);
          setHasUnread(true);
          
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    hasUnread,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
