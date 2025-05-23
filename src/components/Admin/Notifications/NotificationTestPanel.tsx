
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotificationTestPanel = () => {
  const { user } = useAuth();
  const [isTestingAdmin, setIsTestingAdmin] = useState(false);
  const [isTestingUser, setIsTestingUser] = useState(false);
  const [testUserId, setTestUserId] = useState('');

  const testAdminNotification = async () => {
    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    setIsTestingAdmin(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Admin Test Notification',
          message: 'This is a test notification sent by admin to verify the system is working.',
          type: 'other',
          read: false,
          is_test: true
        });

      if (error) throw error;
      toast.success('Admin test notification sent successfully!');
    } catch (error: any) {
      console.error('Error sending admin test notification:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsTestingAdmin(false);
    }
  };

  const testUserNotification = async () => {
    if (!testUserId) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsTestingUser(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: testUserId,
          title: 'System Test Notification',
          message: 'This is a test notification to verify the notification system is working properly.',
          type: 'other',
          read: false,
          is_test: true
        });

      if (error) throw error;
      toast.success('User test notification sent successfully!');
      setTestUserId('');
    } catch (error: any) {
      console.error('Error sending user test notification:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsTestingUser(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Test Notification System</CardTitle>
        <CardDescription>
          Test the notification system to ensure it's working properly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={testAdminNotification}
            disabled={isTestingAdmin}
            variant="outline"
          >
            {isTestingAdmin ? "Sending..." : "Test Admin Notification"}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="testUserId">Test User ID</Label>
          <div className="flex gap-2">
            <Input
              id="testUserId"
              placeholder="Enter user ID to test"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
            />
            <Button 
              onClick={testUserNotification}
              disabled={isTestingUser || !testUserId}
              variant="outline"
            >
              {isTestingUser ? "Sending..." : "Test User Notification"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;
