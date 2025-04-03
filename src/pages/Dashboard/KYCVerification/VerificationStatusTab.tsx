
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KycVerificationData } from '@/hooks/kyc/types';
import VerificationStatus from '@/components/KYC/VerificationStatus';
import { createTestKycRecord } from '@/hooks/kyc/kycService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  isLoading: boolean;
  onStartVerification: () => void;
  onProvideMoreInfo?: () => void;
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({
  kycData,
  isLoading,
  onStartVerification,
  onProvideMoreInfo
}) => {
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  const handleCreateTestData = async () => {
    if (!user) return;
    
    try {
      await createTestKycRecord(user.id);
      toast.success('Test KYC record created successfully');
      
      // Refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error creating test KYC record:', error);
      toast.error('Failed to create test KYC record');
    }
  };
  
  return (
    <div>
      {/* Show admin testing tools in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium mb-2">Developer Testing Tools</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateTestData}
          >
            Create Test KYC Record
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            This will create a test KYC verification record in "pending" status.
          </p>
        </div>
      )}
      
      <VerificationStatus
        status={kycData?.status || 'not_started'}
        rejectionReason={kycData?.rejection_reason}
        clarificationMessage={kycData?.clarification_message}
        onStartVerification={onStartVerification}
        onProvideMoreInfo={onProvideMoreInfo}
      />
      
      {/* Show detailed status info for debugging (in development only) */}
      {process.env.NODE_ENV === 'development' && kycData && (
        <Alert className="mt-8">
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="text-xs font-mono break-words whitespace-pre-wrap mt-2">
              {JSON.stringify(kycData, null, 2)}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VerificationStatusTab;
