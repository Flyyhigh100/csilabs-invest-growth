
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKycVerification } from '@/hooks/useKycVerification';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

interface KycStatusBannerProps {
  showActions?: boolean;
}

const KycStatusBanner: React.FC<KycStatusBannerProps> = ({ showActions = true }) => {
  const { kycData, isLoading } = useKycVerification();

  if (isLoading) {
    return (
      <div className="flex items-center p-4 rounded-md bg-gray-50">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cbis-blue mr-3"></div>
        <div>
          <h3 className="font-medium">Loading verification status...</h3>
        </div>
      </div>
    );
  }

  const getStatusContent = () => {
    switch (kycData?.status) {
      case 'approved':
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
          title: 'KYC Verified',
          description: 'Your identity has been verified successfully.',
          color: 'bg-green-50',
          actionButton: null
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: 'KYC Rejected',
          description: `Your identity verification was rejected. ${kycData.rejection_reason ? `Reason: ${kycData.rejection_reason}` : ''}`,
          color: 'bg-red-50',
          actionButton: (
            <Button className="mt-4" asChild>
              <Link to="/dashboard/kyc">Resubmit KYC</Link>
            </Button>
          )
        };
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-amber-500" />,
          title: 'KYC Pending',
          description: 'Your identity verification is being processed.',
          color: 'bg-amber-50',
          actionButton: null
        };
      default: // not_started
        return {
          icon: <UserCheck className="h-8 w-8 text-blue-500" />,
          title: 'KYC Not Started',
          description: 'You need to complete identity verification.',
          color: 'bg-blue-50',
          actionButton: (
            <Button className="mt-4" variant="outline" asChild>
              <Link to="/dashboard/kyc">
                <UserCheck className="mr-2 h-4 w-4" /> Complete Verification
              </Link>
            </Button>
          )
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className={`flex flex-col p-4 rounded-md ${statusContent.color}`}>
      <div className="flex items-start">
        <div className="mr-4">{statusContent.icon}</div>
        <div>
          <h3 className="font-medium">{statusContent.title}</h3>
          <p className="text-sm text-gray-600">{statusContent.description}</p>
        </div>
      </div>
      {showActions && statusContent.actionButton}
    </div>
  );
};

export default KycStatusBanner;
