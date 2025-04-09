
import React from 'react';
import { KycVerificationData } from '@/hooks/kyc/types';
import VerificationStatus from '@/components/KYC/VerificationStatus'; // Fixed import
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  onRestart: () => void;
  onRefresh?: () => Promise<void>; // Add refresh handler
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({ 
  kycData, 
  onRestart,
  onRefresh 
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <VerificationStatus 
        status={kycData?.status || 'not_started'}
        rejectionReason={kycData?.rejection_reason}
        clarificationMessage={kycData?.clarification_message}
        onStartVerification={onRestart}
      />
      
      <div className="flex justify-between gap-4">
        {kycData?.status === 'rejected' && (
          <Button onClick={onRestart}>
            Restart Verification
          </Button>
        )}
        
        {onRefresh && (
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-auto"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerificationStatusTab;
