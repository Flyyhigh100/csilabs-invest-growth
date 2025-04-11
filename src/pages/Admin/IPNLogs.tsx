
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import IPNLogs from '@/components/Admin/IPNLogs';
import TestIPNForm from '@/components/Admin/TestIPNForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminIPNLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('logs');

  return (
    <AdminLayout title="IPN Logs & Testing">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="logs">IPN Logs</TabsTrigger>
          <TabsTrigger value="test">Test IPN Webhook</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-6">
          <IPNLogs />
        </TabsContent>
        
        <TabsContent value="test" className="space-y-6">
          <TestIPNForm />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminIPNLogsPage;
