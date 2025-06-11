import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other' | 'admin_audit' | 'audit_log';
  is_test?: boolean;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Fetch notifications from the database (excluding admin audit notifications)
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setHasUnread(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching notifications for user: ${user.id}`);
      
      // Filter out admin_audit and audit_log types to reduce noise
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .not('type', 'in', '("admin_audit","audit_log")')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      const notificationsData = data as unknown as Notification[];
      console.log(`Fetched ${notificationsData.length} user notifications (filtered out audit)`);
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
      console.log(`Marking notification as read: ${notificationId}`);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      // Update the local state immediately
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
      setIsMarkingAllRead(true);
      console.log('Marking all notifications as read');
      
      // Get all unread notification IDs first
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) {
        console.log('No unread notifications to mark as read');
        return;
      }
      
      // Update all unread notifications in the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      // Update local state immediately for better UX
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setHasUnread(false);
      
      console.log(`Successfully marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Refresh notifications on error to ensure consistency
      await fetchNotifications();
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Set up real-time subscription for new notifications (excluding audit)
  useEffect(() => {
    if (!user) return;

    console.log(`Setting up real-time subscription for notifications: ${user.id}`);

    // Initial fetch
    fetchNotifications();

    // Subscribe to new notifications and updates (excluding audit types)
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
          const newNotification = payload.new as unknown as Notification;
          
          // Filter out admin audit notifications in real-time
          if (newNotification.type === 'admin_audit' || newNotification.type === 'audit_log') {
            console.log('Filtered out audit notification from real-time feed:', newNotification.type);
            return;
          }
          
          console.log('New notification received via realtime:', payload);
          setNotifications(current => [newNotification, ...current]);
          setHasUnread(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          const updatedNotification = payload.new as unknown as Notification;
          
          // Filter out admin audit notifications in real-time
          if (updatedNotification.type === 'admin_audit' || updatedNotification.type === 'audit_log') {
            return;
          }
          
          console.log('Notification updated via realtime:', payload);
          setNotifications(current => 
            current.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
          
          // Recalculate hasUnread based on all notifications
          setNotifications(current => {
            const stillHasUnread = current.some(n => 
              n.id === updatedNotification.id ? !updatedNotification.read : !n.read
            );
            setHasUnread(stillHasUnread);
            return current.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            );
          });
        }
      )
      .subscribe((status) => {
        console.log(`Notifications realtime subscription status: ${status}`);
      });

    return () => {
      console.log('Cleaning up notifications realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    hasUnread,
    isLoading,
    isMarkingAllRead,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
