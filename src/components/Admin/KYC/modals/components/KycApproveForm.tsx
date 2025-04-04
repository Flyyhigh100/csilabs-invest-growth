
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface KycApproveFormProps {
  onApprove: () => void;
  isPending: boolean;
}

const KycApproveForm: React.FC<KycApproveFormProps> = ({
  onApprove,
  isPending
}) => {
  return (
    <div className="mb-4 border-t pt-4">
      <div className="flex items-start gap-2 mb-2">
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
        <h4 className="font-medium text-green-800">Approve Verification</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        You are about to approve this user's KYC verification. This will grant them full access to the platform.
      </p>
      <div className="flex justify-end">
        <Button 
          onClick={onApprove}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Approval"
          )}
        </Button>
      </div>
    </div>
  );
};

export default KycApproveForm;
