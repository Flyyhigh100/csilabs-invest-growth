
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import TestIPNForm from '@/components/Admin/TestIPNForm';

const TestIPNFormPage: React.FC = () => {
  return (
    <AdminLayout title="Test IPN Form">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Use this form to test IPN notifications and webhook responses.
        </p>
        <TestIPNForm />
      </div>
    </AdminLayout>
  );
};

export default TestIPNFormPage;
