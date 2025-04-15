
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/Admin/Layout';
import SendToUserTab from '@/components/Admin/Notifications/SendToUserTab';
import BroadcastTab from '@/components/Admin/Notifications/BroadcastTab';
import { useNotificationActions } from '@/components/Admin/Notifications/useNotificationActions';

const NotificationsPage = () => {
  const [userId, setUserId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<'wallet' | 'payment' | 'kyc' | 'tokens' | 'other'>('other');
  
  const { 
    handleSendToUser,
    handleBroadcast,
    isSendingToUser,
    isBroadcasting,
    users,
    isLoadingUsers
  } = useNotificationActions();

  const handleTypeChange = (value: string) => {
    // Ensure the value is one of the allowed types
    const allowedTypes: Array<'wallet' | 'payment' | 'kyc' | 'tokens' | 'other'> = ['wallet', 'payment', 'kyc', 'tokens', 'other'];
    setType(allowedTypes.includes(value as any) ? (value as any) : 'other');
  };

  return (
    <AdminLayout title="Notifications Management">
      <Tabs defaultValue="single">
        <TabsList className="mb-4">
          <TabsTrigger value="single">Send to User</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <SendToUserTab 
            userId={userId}
            setUserId={setUserId}
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            type={type}
            onTypeChange={handleTypeChange}
            onSubmit={handleSendToUser}
            isSubmitting={isSendingToUser}
            users={users}
            isLoadingUsers={isLoadingUsers}
          />
        </TabsContent>
        
        <TabsContent value="broadcast">
          <BroadcastTab 
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            type={type}
            onTypeChange={handleTypeChange}
            onSubmit={handleBroadcast}
            isSubmitting={isBroadcasting}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default NotificationsPage;
