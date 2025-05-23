
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotificationTestPanel = () => {
  const { user } = useAuth();
  const [isTestingAdmin, setIsTestingAdmin] = useState(false);
  const [isTestingUser, setIsTestingUser] = useState(false);
  const [isTestingTransaction, setIsTestingTransaction] = useState(false);
  const [testUserId, setTestUserId] = useState('');
  const [testNotificationType, setTestNotificationType] = useState('payment');

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
          type: testNotificationType,
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

  const testTransactionNotifications = async () => {
    if (!testUserId) {
      toast.error('Please enter a user ID for transaction tests');
      return;
    }

    setIsTestingTransaction(true);
    try {
      // Test payment confirmation notification
      await supabase.from('notifications').insert({
        user_id: testUserId,
        title: 'Payment Confirmed',
        message: '🎉 Your card payment of $100.00 has been successfully processed. Your CSI tokens will be sent to your wallet shortly.',
        type: 'payment',
        read: false,
        is_test: true
      });

      // Test token delivery notification
      await supabase.from('notifications').insert({
        user_id: testUserId,
        title: 'CSI Tokens Delivered Successfully',
        message: '🎉 1,000 CSI tokens have been successfully sent to your wallet (0x1234...5678). Transaction ID: 0xabc123...def789. You can verify the transaction on PolygonScan.',
        type: 'tokens',
        read: false,
        is_test: true
      });

      // Test KYC notification
      await supabase.from('notifications').insert({
        user_id: testUserId,
        title: 'KYC Verification Approved',
        message: '✅ Your KYC verification has been approved. You can now make high-value transactions without restrictions.',
        type: 'kyc',
        read: false,
        is_test: true
      });

      toast.success('All transaction test notifications sent successfully!');
    } catch (error: any) {
      console.error('Error sending transaction test notifications:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsTestingTransaction(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Test Notification System</CardTitle>
        <CardDescription>
          Test different types of notifications to ensure the system is working properly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button 
            onClick={testAdminNotification}
            disabled={isTestingAdmin}
            variant="outline"
          >
            {isTestingAdmin ? "Sending..." : "Test Admin Notification"}
          </Button>
        </div>
        
        <div className="space-y-4 border-t pt-4">
          <Label htmlFor="testUserId">Test User ID</Label>
          <Input
            id="testUserId"
            placeholder="Enter user ID to test"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
          />
          
          <Label htmlFor="notificationType">Notification Type</Label>
          <Select value={testNotificationType} onValueChange={setTestNotificationType}>
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="tokens">Tokens</SelectItem>
              <SelectItem value="kyc">KYC</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button 
              onClick={testUserNotification}
              disabled={isTestingUser || !testUserId}
              variant="outline"
            >
              {isTestingUser ? "Sending..." : "Test Single Notification"}
            </Button>
            
            <Button 
              onClick={testTransactionNotifications}
              disabled={isTestingTransaction || !testUserId}
              variant="outline"
            >
              {isTestingTransaction ? "Sending..." : "Test Transaction Flow"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;
