
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useNotificationActions = () => {
  const [notificationType, setNotificationType] = useState('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch all users
  const { data: users = [] } = useQuery({
    queryKey: ['notification-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('email');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    }
  });

  const handleSendToUser = async () => {
    if (!userId || !title || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: notificationType,
        });
      
      if (error) throw error;
      
      toast.success('Notification sent successfully');
      setTitle('');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBroadcast = async () => {
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For each user in the system, create a notification
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type: notificationType,
      }));
      
      if (notifications.length === 0) {
        toast.error('No users found to send notifications to');
        setIsLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
      
      toast.success(`Broadcast sent to ${notifications.length} users`);
      setTitle('');
      setMessage('');
    } catch (error: any) {
      console.error('Error broadcasting notification:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    notificationType,
    setNotificationType,
    title,
    setTitle,
    message,
    setMessage,
    userId,
    setUserId,
    isLoading,
    users,
    handleSendToUser,
    handleBroadcast
  };
};

export default useNotificationActions;
