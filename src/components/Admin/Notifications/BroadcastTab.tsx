
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
  type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other';
  setType: (type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other') => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const BroadcastTab: React.FC<BroadcastTabProps> = ({
  title,
  setTitle,
  message,
  setMessage,
  type,
  setType,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Broadcast to All Users</CardTitle>
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
            type={type}
            setType={setType}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <div className="text-sm text-amber-600 flex items-center w-full sm:w-auto">
          <Mail className="mr-1 h-4 w-4 flex-shrink-0" />
          <span>This will be sent to all users</span>
        </div>
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting || !title || !message}
          className="w-full sm:w-auto"
        >
          <Users className="mr-2 h-4 w-4" />
          {isSubmitting ? "Broadcasting..." : "Broadcast to All"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BroadcastTab;
