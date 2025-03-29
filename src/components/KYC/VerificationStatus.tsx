
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Upload } from 'lucide-react';
import { KycVerificationData } from '@/hooks/useKycVerification';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

interface VerificationStatusProps {
  status: KycStatus;
  rejectionReason?: string | null;
  onStartVerification: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  rejectionReason,
  onStartVerification,
}) => {
  console.log("Current KYC status:", status);
  
  return (
    <div className="text-center py-8">
      {status === 'pending' && (
        <>
          <div className="bg-amber-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Verification in Progress</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Your identity verification is currently being reviewed. This process usually takes 1-2 business days.
            We'll notify you once the review is complete.
          </p>
        </>
      )}
      
      {status === 'approved' && (
        <>
          <div className="bg-green-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Verification Approved</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Your identity has been successfully verified. You now have full access to all platform features.
          </p>
        </>
      )}
      
      {status === 'rejected' && (
        <>
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Verification Rejected</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Unfortunately, your verification was rejected. Reason: {rejectionReason || "Unspecified reason"}
          </p>
          <Button 
            onClick={onStartVerification} 
            className="mb-4"
          >
            Resubmit Verification
          </Button>
        </>
      )}
      
      {status === 'not_started' && (
        <>
          <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Upload className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Verification Not Started</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            You haven't started the verification process yet. Complete the verification to unlock all platform features.
          </p>
          <Button 
            onClick={onStartVerification} 
            className="mb-4"
          >
            Start Verification
          </Button>
        </>
      )}
      
      <Button asChild variant="outline">
        <Link to="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default VerificationStatus;
