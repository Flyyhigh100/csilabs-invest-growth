
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import UserSelector from './UserSelector';
import NotificationFormFields from './NotificationFormFields';
import { NotificationType } from './useNotificationActions';

interface SendToUserTabProps {
  title: string;
  setTitle: (title: string) => void;
  message: string;
  setMessage: (message: string) => void;
  type: NotificationType;
  setType: (type: NotificationType) => void;
  userId: string;
  setUserId: (userId: string) => void;
  users: { id: string; email: string }[];
  isLoading: boolean;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const SendToUserTab: React.FC<SendToUserTabProps> = ({
  title,
  setTitle,
  message,
  setMessage,
  type,
  setType,
  userId,
  setUserId,
  users,
  isLoading,
  onSubmit,
  isSubmitting,
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
            type={type}
            setType={setType}
          />
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting || !title || !message || !userId}
        >
          <Bell className="mr-2 h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send Notification"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SendToUserTab;
