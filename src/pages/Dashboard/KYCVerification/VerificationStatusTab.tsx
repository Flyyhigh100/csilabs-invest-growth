
import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { KycVerificationData } from '@/hooks/kyc';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createTestKycRecord } from '@/components/Admin/KYC/KycVerificationsService';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

interface VerificationStatusTabProps {
  kycData: KycVerificationData | null;
  isLoading: boolean;
  refetch: () => void;
  // Add the missing props that KYCTabs.tsx is trying to pass
  onStartVerification?: () => void;
  onProvideMoreInfo?: () => void;
}

const VerificationStatusTab: React.FC<VerificationStatusTabProps> = ({ 
  kycData, 
  isLoading,
  refetch,
  onStartVerification,
  onProvideMoreInfo
}) => {
  const { user } = useAuth();
  
  const getStatusContent = () => {
    // Fix the type error by properly checking the status
    // First, ensure we have a valid status from the KYC data
    const status = kycData?.status as KycStatus | undefined;
    
    switch (status) {
      case 'approved':
        return {
          title: 'Verification Approved',
          description: 'Congratulations! Your identity has been verified successfully.',
          icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
          color: 'bg-green-50 border-green-200',
          showRefresh: false
        };
      case 'rejected':
        return {
          title: 'Verification Rejected',
          description: kycData?.rejection_reason 
            ? `Your verification was rejected. Reason: ${kycData.rejection_reason}` 
            : 'Your verification was rejected. Please resubmit with correct information.',
          icon: <AlertCircle className="h-16 w-16 text-red-500" />,
          color: 'bg-red-50 border-red-200',
          showRefresh: true
        };
      case 'pending':
        return {
          title: 'Verification in Progress',
          description: 'Your verification is currently being reviewed by our team. This usually takes 1-2 business days.',
          icon: <Clock className="h-16 w-16 text-amber-500" />,
          color: 'bg-amber-50 border-amber-200',
          showRefresh: true
        };
      // Handle as a valid case, not in the comparison
      case 'not_started':
      default:
        return {
          title: 'Verification Not Started',
          description: 'Please complete the personal information and document upload steps to start the verification process.',
          icon: <Clock className="h-16 w-16 text-gray-400" />,
          color: 'bg-gray-50 border-gray-200',
          showRefresh: false
        };
    }
  };
  
  const content = getStatusContent();
  
  const handleRefresh = () => {
    refetch();
    toast.success('Refreshing verification status...');
  };
  
  const handleDebugInsert = async () => {
    if (!user) {
      toast.error('No active user session');
      return;
    }
    
    try {
      toast.loading('Creating test verification...');
      await createTestKycRecord();
      toast.success('Test verification created successfully');
      refetch();
    } catch (error) {
      console.error('Error creating test verification:', error);
      toast.error('Failed to create test verification');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className={`p-6 rounded-lg border ${content.color} flex flex-col items-center text-center`}>
        <div className="mb-4">
          {content.icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
        <p className="text-gray-600 mb-6">{content.description}</p>
        
        {kycData?.submitted_at && (
          <div className="text-sm text-gray-500 mb-4">
            Submitted: {new Date(kycData.submitted_at).toLocaleString()}
          </div>
        )}
        
        {content.showRefresh && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
          </div>
        )}
        
        {/* If onStartVerification is provided, and we're in not_started state, show a button */}
        {onStartVerification && (!kycData || kycData.status === 'not_started') && (
          <Button onClick={onStartVerification} className="mt-4">
            Start Verification
          </Button>
        )}
        
        {/* If onProvideMoreInfo is provided and there's a clarification message, show that button */}
        {onProvideMoreInfo && kycData?.clarification_message && (
          <Button onClick={onProvideMoreInfo} variant="outline" className="mt-4">
            Provide Additional Information
          </Button>
        )}
        
        {/* Debug tools - only show in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 pt-4 border-t border-dashed border-gray-300 w-full">
            <p className="text-xs text-gray-500 mb-2">Debug Tools</p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDebugInsert}
                className="text-xs"
              >
                Create Test Verification
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="text-xs"
              >
                Force Refresh
              </Button>
            </div>
            <div className="mt-2 text-xs text-left bg-gray-100 p-2 rounded overflow-auto max-h-32">
              <pre>{JSON.stringify({
                id: kycData?.id,
                status: kycData?.status,
                submitted_at: kycData?.submitted_at,
                reviewed_at: kycData?.reviewed_at
              }, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatusTab;
