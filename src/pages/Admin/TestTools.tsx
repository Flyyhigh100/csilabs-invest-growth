
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
// Import with correct casing
import TestIPNForm from '@/components/Admin/TestIPNForm';

const TestToolsPage: React.FC = () => {
  return (
    <AdminLayout title="Test Tools">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Tools for testing and troubleshooting payment integrations.
        </p>

        <TestIPNForm />
      </div>
    </AdminLayout>
  );
};

export default TestToolsPage;
