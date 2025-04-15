
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import UserSelector from './UserSelector';
import NotificationFormFields from './NotificationFormFields';

interface SendToUserTabProps {
  title: string;
  setTitle: (title: string) => void;
  message: string;
  setMessage: (message: string) => void;
  notificationType: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other';
  setNotificationType: (type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other') => void;
  userId: string;
  setUserId: (userId: string) => void;
  users: { id: string; email: string }[];
  isLoading: boolean;
  handleSendToUser: () => Promise<void>;
}

const SendToUserTab: React.FC<SendToUserTabProps> = ({
  title,
  setTitle,
  message,
  setMessage,
  notificationType,
  setNotificationType,
  userId,
  setUserId,
  users,
  isLoading,
  handleSendToUser,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification to User</CardTitle>
        <CardDescription>
          Create and send a notification to a specific user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <UserSelector
            userId={userId}
            setUserId={setUserId}
            users={users}
            isLoading={isLoading}
          />
          
          <NotificationFormFields
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            notificationType={notificationType}
            setNotificationType={setNotificationType}
          />
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
  );
};

export default SendToUserTab;
