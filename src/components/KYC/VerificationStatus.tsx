
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Upload, AlertCircle, ExternalLink } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type KycStatus = Database['public']['Enums']['kyc_status'];

interface VerificationStatusProps {
  status: KycStatus;
  rejectionReason?: string | null;
  clarificationMessage?: string | null;
  onStartVerification: () => void;
  onProvideMoreInfo?: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  rejectionReason,
  clarificationMessage,
  onStartVerification,
  onProvideMoreInfo,
}) => {
  console.log("Rendering VerificationStatus component with status:", status);
  console.log("Clarification message:", clarificationMessage);
  console.log("Rejection reason:", rejectionReason);
  
  // Trigger a debugging log whenever this component renders with a new status
  useEffect(() => {
    console.log("VerificationStatus mounted/updated with status:", status);
  }, [status]);
  
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
          <div className="flex justify-center mb-4">
            <Button asChild variant="outline" className="mr-2">
              <Link to="/dashboard/payments">Buy Tokens</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </>
      )}
      
      {status === 'rejected' && (
        <>
          <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Verification Rejected</h3>
          
          {rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 max-w-md mx-auto text-left">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Reason for Rejection</h4>
                  <p className="text-red-700 text-sm mt-1">{rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Unfortunately, your verification was rejected. Please review the reason above and resubmit with the correct information.
          </p>
          
          <Button 
            onClick={onStartVerification} 
            className="mb-4"
          >
            Resubmit Verification
          </Button>
        </>
      )}
      
      {status === 'needs_clarification' && (
        <>
          <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Additional Information Needed</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            We need some clarification on your submitted documents.
          </p>
          
          {clarificationMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 max-w-md mx-auto text-left">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Additional Information Requested</h4>
                  <p className="text-blue-700 text-sm mt-1">{clarificationMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {onProvideMoreInfo && (
            <Button 
              onClick={onProvideMoreInfo}
              className="mb-4"
            >
              Provide Additional Information
            </Button>
          )}
        </>
      )}
      
      {(status === 'not_started' || !status) && (
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
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          If you're experiencing any issues with verification, please{' '}
          <a href="mailto:support@example.com" className="text-blue-600 hover:underline inline-flex items-center">
            contact support
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default VerificationStatus;
