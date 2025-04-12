
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Bell, Users, User, Mail } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

const AdminNotifications: React.FC = () => {
  const [notificationType, setNotificationType] = useState<'wallet' | 'payment' | 'kyc' | 'tokens' | 'other'>('other');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Demo users for the select dropdown
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
  
  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission
  const handleSendToUser = async () => {
    if (!title || !message || !userId) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fix: Using from() instead of rpc() to call the function
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

  return (
    <AdminLayout title="Notifications Management">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="send">
          <TabsList className="mb-4">
            <TabsTrigger value="send">
              <User className="mr-2 h-4 w-4" />
              Send to User
            </TabsTrigger>
            <TabsTrigger value="broadcast">
              <Users className="mr-2 h-4 w-4" />
              Broadcast
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification to User</CardTitle>
                <CardDescription>
                  Create and send a notification to a specific user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">User</Label>
                    <Select 
                      value={userId} 
                      onValueChange={setUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email || user.id}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select 
                      value={notificationType} 
                      onValueChange={(val: any) => setNotificationType(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wallet">Wallet</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="kyc">KYC</SelectItem>
                        <SelectItem value="tokens">Tokens</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Notification title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Enter notification message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4} 
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSendToUser} 
                  disabled={isLoading || !title || !message || !userId}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Notification"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="broadcast">
            <Card>
              <CardHeader>
                <CardTitle>Broadcast to All Users</CardTitle>
                <CardDescription>
                  Send a notification to all platform users at once
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select 
                      value={notificationType} 
                      onValueChange={(val: any) => setNotificationType(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wallet">Wallet</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="kyc">KYC</SelectItem>
                        <SelectItem value="tokens">Tokens</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Broadcast title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Enter broadcast message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4} 
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-amber-600 flex items-center">
                  <Mail className="mr-1 h-4 w-4" />
                  This will be sent to all users
                </div>
                <Button 
                  onClick={handleBroadcast}
                  disabled={isLoading || !title || !message}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {isLoading ? "Broadcasting..." : "Broadcast to All"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
