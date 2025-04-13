
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users } from 'lucide-react';
import NotificationFormFields from './NotificationFormFields';

interface BroadcastTabProps {
  title: string;
  setTitle: (title: string) => void;
  message: string;
  setMessage: (message: string) => void;
  notificationType: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other';
  setNotificationType: (type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other') => void;
  isLoading: boolean;
  handleBroadcast: () => Promise<void>;
}

const BroadcastTab: React.FC<BroadcastTabProps> = ({
  title,
  setTitle,
  message,
  setMessage,
  notificationType,
  setNotificationType,
  isLoading,
  handleBroadcast,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Broadcast to All Users</CardTitle>
        <CardDescription>
          Send a notification to all platform users at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
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
  );
};

export default BroadcastTab;
