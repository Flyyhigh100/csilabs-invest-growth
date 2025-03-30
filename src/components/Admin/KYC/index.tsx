
import React from 'react';
import { KycProvider } from './KycContext';
import KycVerificationsDashboard from './KycVerificationsDashboard';

// Main component for KYC verifications
const KycVerifications = () => {
  return (
    <KycProvider>
      <KycVerificationsDashboard />
    </KycProvider>
  );
};

export default KycVerifications;
