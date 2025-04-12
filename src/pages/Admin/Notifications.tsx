
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users } from 'lucide-react';
import SendToUserTab from '@/components/Admin/Notifications/SendToUserTab';
import BroadcastTab from '@/components/Admin/Notifications/BroadcastTab';
import { useNotificationActions } from '@/components/Admin/Notifications/useNotificationActions';

const AdminNotifications: React.FC = () => {
  const {
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
  } = useNotificationActions();

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
            <SendToUserTab 
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
              notificationType={notificationType}
              setNotificationType={setNotificationType}
              userId={userId}
              setUserId={setUserId}
              users={users}
              isLoading={isLoading}
              handleSendToUser={handleSendToUser}
            />
          </TabsContent>
          
          <TabsContent value="broadcast">
            <BroadcastTab 
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
              notificationType={notificationType}
              setNotificationType={setNotificationType}
              isLoading={isLoading}
              handleBroadcast={handleBroadcast}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
