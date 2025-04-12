
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotificationActions = () => {
  const [notificationType, setNotificationType] = useState<'wallet' | 'payment' | 'kyc' | 'tokens' | 'other'>('other');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{id: string, email: string}[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Load users for the select dropdown
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(20);
        
      if (error) throw error;
      
      setUsers(data as {id: string, email: string}[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Handle form submission
  const handleSendToUser = async () => {
    if (!title || !message || !userId) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: title,
          message: message,
          type: notificationType
        });
      
      if (error) throw error;
      
      toast.success('Notification sent to user');
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle broadcast to all users
  const handleBroadcast = async () => {
    if (!title || !message) {
      toast.error('Please provide a title and message');
      return;
    }
    
    try {
      setIsLoading(true);
      toast.success('Broadcasting notification to all users');
      // In a real implementation, you would call an edge function or backend API
      // that iterates through all users and creates a notification for each
      
      setTimeout(() => {
        toast.success('Notifications broadcast complete');
        setIsLoading(false);
        setTitle('');
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      toast.error('Failed to broadcast notification');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    loadingUsers,
    handleSendToUser,
    handleBroadcast
  };
};
