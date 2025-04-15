
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, Settings as SettingsIcon, Mail, Bell, Shield, WrenchIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Import the new tab components
import NotificationsTab from '@/components/Admin/Settings/NotificationsTab';
import ApiConfigTab from '@/components/Admin/Settings/ApiConfigTab';
import SecurityTab from '@/components/Admin/Settings/SecurityTab';
import ToolsTab from '@/components/Admin/Settings/ToolsTab';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  
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

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
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
          <TabsTrigger value="tools">
            <WrenchIcon className="mr-2 h-4 w-4" />
            Transaction Tools
          </TabsTrigger>
        </TabsList>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab 
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            kycAlerts={kycAlerts}
            setKycAlerts={setKycAlerts}
            paymentAlerts={paymentAlerts}
            setPaymentAlerts={setPaymentAlerts}
            onSave={handleSaveNotificationSettings}
          />
        </TabsContent>

        {/* API Configuration */}
        <TabsContent value="api" className="space-y-4">
          <ApiConfigTab 
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
            apiTimeout={apiTimeout}
            setApiTimeout={setApiTimeout}
            onSave={handleSaveAPISettings}
          />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <SecurityTab 
            twoFactorEnabled={twoFactorEnabled}
            onToggle2FA={handleToggle2FA}
            onSave={handleSaveSecuritySettings}
          />
        </TabsContent>

        {/* Transaction Tools */}
        <TabsContent value="tools" className="space-y-4">
          <ToolsTab 
            onGoToTransactionTools={handleGoToTransactionTools}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
