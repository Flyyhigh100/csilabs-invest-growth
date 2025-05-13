import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Info, Settings as SettingsIcon, Mail, Bell, Shield, WrenchIcon, Coins, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import APIKeyValidator from '@/components/Admin/APIKeyValidator';
import CoinPaymentsConfig from '@/components/Admin/CoinPayments/CoinPaymentsConfig';
import TestDataToggle from '@/components/Admin/TestDataToggle';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';

// For simplicity, we'll simulate settings state with React state
// In a real app, this would be connected to the database
const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { includeTestData, setIncludeTestData } = useTestDataToggle();
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [kycAlerts, setKycAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  
  // API settings
  const [apiUrl, setApiUrl] = useState('https://api.defined.fi/api/v1');
  const [apiTimeout, setApiTimeout] = useState('30');

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Settings handlers
  const handleSaveNotificationSettings = () => {
    toast.success('Notification settings saved successfully');
  };

  const handleSaveAPISettings = () => {
    toast.success('API settings saved successfully');
  };

  const handleSaveSecuritySettings = () => {
    toast.success('Security settings saved successfully');
    if (twoFactorEnabled) {
      toast.info('Two-factor authentication setup instructions have been sent to your email');
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (checked) {
      toast.info('Please complete setup by following the instructions that will be sent to your email');
    }
  };

  const handleGoToTransactionTools = () => {
    navigate('/admin/transaction-tools');
  };

  return (
    <AdminLayout title="Settings">
      <div className="mb-6">
        <Alert variant="success" className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your settings changes will be applied immediately for all admins.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="data" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="data">
            <Database className="mr-2 h-4 w-4" />
            Data Management
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api">
            <SettingsIcon className="mr-2 h-4 w-4" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Coins className="mr-2 h-4 w-4" />
            Payment Gateways
          </TabsTrigger>
          <TabsTrigger value="tools">
            <WrenchIcon className="mr-2 h-4 w-4" />
            Transaction Tools
          </TabsTrigger>
        </TabsList>
        
        {/* Data Management Settings */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Data Management</CardTitle>
              <CardDescription>
                Control whether test data is included in your admin interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="test-data-toggle" className="text-base font-medium block mb-2">
                    Include Test Data
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    When enabled, test data will be included in all admin views, charts, and tables.
                    This setting is synchronized across all your admin sessions.
                  </p>
                  
                  <TestDataToggle 
                    checked={includeTestData}
                    onCheckedChange={setIncludeTestData}
                  />
                </div>
                
                <Separator />
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h3 className="font-medium text-amber-800 mb-2">About Test Data</h3>
                  <p className="text-sm text-amber-700">
                    Test data is marked with the <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">is_test</code> flag
                    in the database. This allows you to test features without affecting your real transaction and KYC data.
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    In production, you should typically keep this setting disabled to avoid confusion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
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
                <Button onClick={handleSaveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Configuration */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure the API integrations and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="api-url">Defined.fi API URL</Label>
                  <Input 
                    id="api-url" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.defined.fi/api/v1"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
                  <Input 
                    id="api-timeout"
                    type="number"
                    value={apiTimeout}
                    onChange={(e) => setApiTimeout(e.target.value)}
                    placeholder="30"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveAPISettings}>
                    Save API Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* API Key Validator */}
          <APIKeyValidator />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
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
                    onCheckedChange={handleToggle2FA}
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
                  <Button onClick={handleSaveSecuritySettings}>
                    Save Security Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Gateways Tab */}
        <TabsContent value="payments" className="space-y-4">
          <CoinPaymentsConfig />
        </TabsContent>

        {/* Transaction Tools */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Tools</CardTitle>
              <CardDescription>
                Access tools for managing and troubleshooting transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Transaction Management</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Tools to help manage and troubleshoot transaction processes
                  </p>
                  <Button onClick={handleGoToTransactionTools}>
                    Open Transaction Tools
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
