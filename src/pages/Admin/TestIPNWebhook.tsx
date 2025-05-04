
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';

const TestIPNWebhook: React.FC = () => {
  return (
    <AdminLayout title="Test IPN Webhook">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          This page allows testing of the IPN webhook functionality.
        </p>
        {/* Add webhook testing functionality here */}
      </div>
    </AdminLayout>
  );
};

export default TestIPNWebhook;
