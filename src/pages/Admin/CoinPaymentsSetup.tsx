
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import CoinPaymentsConfig from '@/components/Admin/CoinPayments/CoinPaymentsConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

const CoinPaymentsSetupPage: React.FC = () => {
  return (
    <AdminLayout title="CoinPayments Setup">
      <div className="space-y-6">
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>Direct Configuration</AlertTitle>
          <AlertDescription>
            This page allows you to update your CoinPayments credentials directly in both the database and edge functions.
            After updating, use the API Key Validator to verify the credentials are working correctly.
          </AlertDescription>
        </Alert>
        
        <CoinPaymentsConfig />
      </div>
    </AdminLayout>
  );
};

export default CoinPaymentsSetupPage;
