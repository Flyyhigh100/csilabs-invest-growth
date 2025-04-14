
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/Admin/Layout';
import SendToUserTab from '@/components/Admin/Notifications/SendToUserTab';
import BroadcastTab from '@/components/Admin/Notifications/BroadcastTab';
import { useNotificationActions } from '@/components/Admin/Notifications/useNotificationActions';

const NotificationsPage = () => {
  const { 
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
  } = useNotificationActions();

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
            setType={setType}
            onSubmit={handleSendToUser}
            isSubmitting={isSendingToUser}
            users={users}
            isLoading={isLoadingUsers}
          />
        </TabsContent>
        
        <TabsContent value="broadcast">
          <BroadcastTab 
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            type={type}
            setType={setType}
            onSubmit={handleBroadcast}
            isSubmitting={isBroadcasting}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default NotificationsPage;
