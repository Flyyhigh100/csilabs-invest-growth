
import React from 'react';
import { Button } from '@/components/ui/button';
import { KycVerificationData } from '@/hooks/kyc/types';
import { AlertCircle, CheckCircle, Clock, RotateCw, FilePlus2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  isLoading: boolean;
  onStartVerification: () => void;
  onProvideMoreInfo: () => void;
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({
  kycData,
  isLoading,
  onStartVerification,
  onProvideMoreInfo
}) => {
  const getStatusContent = () => {
    if (!kycData) {
      return {
        icon: <FilePlus2 className="h-12 w-12 text-blue-500" />,
        title: 'Start Verification',
        description: 'You have not started the verification process yet. Click the button below to begin.',
        color: 'bg-blue-50 border-blue-200',
        action: (
          <Button 
            onClick={onStartVerification}
            className="mt-4"
          >
            Start Verification
          </Button>
        )
      };
    }

    const status = kycData.status;

    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: 'Verification Approved',
          description: 'Your identity has been verified successfully. You now have full access to all platform features.',
          color: 'bg-green-50 border-green-200',
          action: null
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: 'Verification Rejected',
          description: kycData.rejection_reason 
            ? `Your verification was rejected: ${kycData.rejection_reason}` 
            : 'Your verification was rejected. Please restart the verification process.',
          color: 'bg-red-50 border-red-200',
          action: (
            <Button 
              onClick={onStartVerification}
              className="mt-4"
              variant="destructive"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Restart Verification
            </Button>
          )
        };
      case 'pending':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: 'Verification Pending',
          description: 'Your verification is being reviewed. This process typically takes 1-2 business days.',
          color: 'bg-amber-50 border-amber-200',
          action: null
        };
      case 'needs_clarification':
        return {
          icon: <AlertCircle className="h-12 w-12 text-purple-500" />,
          title: 'Additional Information Needed',
          description: kycData.clarification_message 
            ? `We need additional information: ${kycData.clarification_message}` 
            : 'We need additional information to complete your verification.',
          color: 'bg-purple-50 border-purple-200',
          action: (
            <Button 
              onClick={onProvideMoreInfo}
              className="mt-4"
              variant="outline"
            >
              <FilePlus2 className="mr-2 h-4 w-4" />
              Provide Information
            </Button>
          )
        };
      default:
        return {
          icon: <FilePlus2 className="h-12 w-12 text-blue-500" />,
          title: 'Start Verification',
          description: 'You have not completed the verification process. Please provide all required information.',
          color: 'bg-blue-50 border-blue-200',
          action: (
            <Button 
              onClick={onStartVerification}
              className="mt-4"
            >
              Start Verification
            </Button>
          )
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="py-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className={cn("p-6 rounded-lg border", content.color)}>
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              {content.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
              <p className="text-gray-600 mb-4">{content.description}</p>
              {content.action}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatusTab;
