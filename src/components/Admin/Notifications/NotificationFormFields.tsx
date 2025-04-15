
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  message: string;
  setMessage: (message: string) => void;
  notificationType: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other';
  setNotificationType: (type: 'wallet' | 'payment' | 'kyc' | 'tokens' | 'other') => void;
}

const NotificationFormFields: React.FC<NotificationFormFieldsProps> = ({
  title,
  setTitle,
  message,
  setMessage,
  notificationType,
  setNotificationType,
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default NotificationFormFields;
