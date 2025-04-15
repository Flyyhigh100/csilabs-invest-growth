
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';

interface SecurityTabProps {
  twoFactorEnabled: boolean;
  onToggle2FA: (checked: boolean) => void;
  onSave: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  twoFactorEnabled,
  onToggle2FA,
  onSave,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure security options for admin accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor" className="font-medium">
                Two-Factor Authentication (2FA)
              </Label>
              <p className="text-sm text-muted-foreground">
                Enhance account security by requiring a second authentication factor
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={onToggle2FA}
            />
          </div>
          
          {twoFactorEnabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription>
                Please check your email for instructions on completing 2FA setup.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave}>
              Save Security Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
