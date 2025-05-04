
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { KycVerificationData } from '@/hooks/kyc/types';

interface KycStatusAlertsProps {
  kycData: KycVerificationData | null;
  amount: number;
  allowPaymentsWithoutKYC?: boolean;
}

const KycStatusAlerts: React.FC<KycStatusAlertsProps> = ({
  kycData,
  amount,
  allowPaymentsWithoutKYC = false // Changed default to false for production
}) => {
  const isKycPending = kycData?.status === 'pending';
  const isKycRejected = kycData?.status === 'rejected';
  const isKycApproved = kycData?.status === 'approved';

  // No test mode alert in production - this component now returns null 
  // unless we want to show specific alerts in the future
  return null;
};

export const KycRequirementAlert: React.FC<{
  amount: number;
  kycData: KycVerificationData | null;
}> = ({ amount, kycData }) => {
  const isKycPending = kycData?.status === 'pending';
  const isKycRejected = kycData?.status === 'rejected';
  
  if (amount < 10000) return null;
  
  if (isKycPending) {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-300">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">KYC Verification In Progress</AlertTitle>
        <AlertDescription className="text-amber-700">
          Your KYC verification is being reviewed. Crypto payments of $10,000 or more will be available once verification is approved.
        </AlertDescription>
      </Alert>
    );
  } else if (isKycRejected) {
    return (
      <Alert className="mb-4 bg-red-50 border-red-300">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800">KYC Verification Rejected</AlertTitle>
        <AlertDescription className="text-red-700">
          Your KYC verification was rejected. Please try again with valid documents to process crypto payments of $10,000 or more.
          <Button asChild variant="link" className="p-0 ml-2 text-red-700 font-medium">
            <Link to="/dashboard/kyc">Verify Now</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  } else if (!kycData?.status || kycData?.status === 'not_started' || kycData?.status === 'needs_clarification') {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-300">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">KYC Verification Required</AlertTitle>
        <AlertDescription className="text-amber-700">
          Crypto payments of $10,000 or more require KYC verification for regulatory compliance.
          <Button asChild variant="link" className="p-0 ml-2 text-amber-700 font-medium">
            <Link to="/dashboard/kyc">Verify Now</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default KycStatusAlerts;
