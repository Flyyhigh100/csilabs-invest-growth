
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useNotificationActions = () => {
  const [type, setType] = useState<'wallet' | 'payment' | 'kyc' | 'tokens' | 'other'>('other');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isSendingToUser, setIsSendingToUser] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
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
    
    setIsSendingToUser(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
        });
      
      if (error) throw error;
      
      toast.success('Notification sent successfully');
      setTitle('');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSendingToUser(false);
    }
  };
  
  const handleBroadcast = async () => {
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsBroadcasting(true);
    
    try {
      // For each user in the system, create a notification
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type,
      }));
      
      if (notifications.length === 0) {
        toast.error('No users found to send notifications to');
        setIsBroadcasting(false);
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
      setIsBroadcasting(false);
    }
  };
  
  return {
    type,
    setType,
    title,
    setTitle,
    message,
    setMessage,
    userId,
    setUserId,
    isSendingToUser,
    isBroadcasting,
    users,
    isLoadingUsers,
    handleSendToUser,
    handleBroadcast
  };
};

export default useNotificationActions;
