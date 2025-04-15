
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface NotificationsTabProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  kycAlerts: boolean;
  setKycAlerts: (value: boolean) => void;
  paymentAlerts: boolean;
  setPaymentAlerts: (value: boolean) => void;
  onSave: () => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  emailNotifications,
  setEmailNotifications,
  kycAlerts,
  setKycAlerts,
  paymentAlerts,
  setPaymentAlerts,
  onSave,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Configure when to receive email notifications for important events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">
                Enable Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for critical events
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="kyc-alerts" className="font-medium">
                KYC Verification Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Be notified when users submit KYC verifications
              </p>
            </div>
            <Switch
              id="kyc-alerts"
              checked={kycAlerts}
              onCheckedChange={setKycAlerts}
              disabled={!emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-alerts" className="font-medium">
                Payment Transaction Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Be notified of high-value payments requiring approval
              </p>
            </div>
            <Switch
              id="payment-alerts"
              checked={paymentAlerts}
              onCheckedChange={setPaymentAlerts}
              disabled={!emailNotifications}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onSave}>
            Save Notification Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
