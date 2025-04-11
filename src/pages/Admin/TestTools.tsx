
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
// Fix casing to match actual file
import TestIpnForm from '@/components/Admin/TestIpnForm';

const TestToolsPage: React.FC = () => {
  return (
    <AdminLayout title="Test Tools">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Tools for testing and troubleshooting payment integrations.
        </p>

        <TestIpnForm />
      </div>
    </AdminLayout>
  );
};

export default TestToolsPage;
