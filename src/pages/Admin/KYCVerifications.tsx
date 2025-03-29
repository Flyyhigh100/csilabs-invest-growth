
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import KycVerifications from '@/components/Admin/KycVerifications';

const AdminKycPage: React.FC = () => {
  return (
    <AdminLayout title="KYC Verifications">
      <KycVerifications />
    </AdminLayout>
  );
};

export default AdminKycPage;
