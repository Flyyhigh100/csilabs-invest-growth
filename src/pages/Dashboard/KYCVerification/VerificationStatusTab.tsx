
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import VerificationStatus from '@/components/KYC/VerificationStatus';
import { KycVerificationData } from '@/hooks/kyc/types';

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  onRestart: () => void;
  onRefresh: () => Promise<void>;
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({ 
  kycData,
  onRestart,
  onRefresh 
}) => {
  const isRejected = kycData?.status === 'rejected';
  const needsClarification = kycData?.status === 'needs_clarification';
  
  // This is the handler that will be passed to the VerificationStatus component
  const handleStartVerification = () => {
    onRestart();
  };
  
  return (
    <div className="space-y-6 py-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Verification Status</h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>
      
      <VerificationStatus 
        status={kycData?.status || 'not_started'} 
        rejectionReason={kycData?.rejection_reason}
        clarificationMessage={kycData?.clarification_message}
        onStartVerification={handleStartVerification}
        onProvideMoreInfo={handleStartVerification}
      />
      
      {isRejected && kycData?.rejection_reason && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Verification Rejected</h3>
              <p className="text-sm text-red-700 mt-1">
                Reason: {kycData.rejection_reason}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {needsClarification && kycData?.clarification_message && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800">Additional Information Needed</h3>
              <p className="text-sm text-blue-700 mt-1">
                {kycData.clarification_message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {(isRejected || needsClarification) && (
        <Button onClick={onRestart} className="mt-6">
          Restart Verification Process
        </Button>
      )}
    </div>
  );
};

export default VerificationStatusTab;
