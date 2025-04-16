
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
    handleSendToUser,
    handleBroadcast,
    isSendingToUser,
    isBroadcasting,
    users,
    isLoadingUsers
  } = useNotificationActions();

  return (
    <AdminLayout title="Notifications Management">
      <Tabs defaultValue="single" className="overflow-x-hidden w-full">
        <TabsList className="mb-4 w-full grid grid-cols-2">
          <TabsTrigger value="single" className="text-xs md:text-sm">Send to User</TabsTrigger>
          <TabsTrigger value="broadcast" className="text-xs md:text-sm">Broadcast</TabsTrigger>
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
