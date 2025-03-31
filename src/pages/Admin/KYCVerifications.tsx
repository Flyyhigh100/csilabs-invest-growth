
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import KycVerifications from '@/components/Admin/KYC';
import { KycProvider } from '@/components/Admin/KYC/KycContext';

const AdminKycPage: React.FC = () => {
  return (
    <AdminLayout title="KYC Verifications">
      <KycProvider>
        <KycVerifications />
      </KycProvider>
    </AdminLayout>
  );
};

export default AdminKycPage;
