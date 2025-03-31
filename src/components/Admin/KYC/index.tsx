
import React from 'react';
import { KycProvider } from './KycContext';
import KycVerificationsDashboard from './Dashboard';

const KycVerifications: React.FC = () => {
  // We're already wrapped in a KycProvider in AdminKycPage.tsx,
  // so we don't need to wrap again here to avoid context duplication
  return <KycVerificationsDashboard />;
};

export default KycVerifications;
