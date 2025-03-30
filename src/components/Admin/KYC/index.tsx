
import React from 'react';
import { KycProvider } from './KycContext';
import KycVerificationsDashboard from './Dashboard';

const KycVerifications: React.FC = () => {
  return (
    <KycProvider>
      <KycVerificationsDashboard />
    </KycProvider>
  );
};

export default KycVerifications;
