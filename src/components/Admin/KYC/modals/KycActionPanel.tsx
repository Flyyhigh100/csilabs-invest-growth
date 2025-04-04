
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, MessageSquare, AlertTriangle, Loader2, BugPlay
} from 'lucide-react';
import { KycVerificationWithProfile } from '../types';

interface KycActionPanelProps {
  selectedKyc: KycVerificationWithProfile;
  activeAction: string | null;
  setActiveAction: (action: string | null) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  clarificationMessage: string;
  setClarificationMessage: (message: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestClarification: () => void;
  isPending: boolean;
}

const KycActionPanel: React.FC<KycActionPanelProps> = ({
  selectedKyc,
  activeAction,
  setActiveAction,
  rejectionReason,
  setRejectionReason,
  clarificationMessage,
  setClarificationMessage,
  onApprove,
  onReject,
  onRequestClarification,
  isPending
}) => {
  if (selectedKyc.status !== 'pending') {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Process Verification</h3>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button 
          variant="outline" 
          className={`flex items-center justify-center ${activeAction === 'reject' ? 'bg-red-50 border-red-300' : ''}`}
          onClick={() => setActiveAction(activeAction === 'reject' ? null : 'reject')}
          disabled={isPending}
        >
          <XCircle className="mr-1 h-4 w-4" />
          Reject
        </Button>
        
        <Button 
          variant="outline"
          className={`flex items-center justify-center ${activeAction === 'clarify' ? 'bg-blue-50 border-blue-300' : ''}`}
          onClick={() => setActiveAction(activeAction === 'clarify' ? null : 'clarify')}
          disabled={isPending}
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          Request Info
        </Button>
        
        <Button 
          variant="outline"
          className={`flex items-center justify-center ${activeAction === 'approve' ? 'bg-green-50 border-green-300' : ''}`}
          onClick={() => setActiveAction(activeAction === 'approve' ? null : 'approve')}
          disabled={isPending}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Approve
        </Button>
      </div>
      
      {/* Debug Info Panel - shown in development */}
      <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-mono">
        <div className="flex items-start gap-1">
          <BugPlay className="h-3 w-3 mt-0.5 text-slate-500" />
          <div>
            <p className="font-semibold">Debug Info:</p>
            <p>KYC ID: {selectedKyc.id}</p>
            <p>Current Status: {selectedKyc.status}</p>
            <p>Is Processing: {isPending ? 'Yes' : 'No'}</p>
            <p>Selected Action: {activeAction || 'None'}</p>
          </div>
        </div>
      </div>
      
      {activeAction === 'reject' && (
        <div className="mb-4 border-t pt-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <h4 className="font-medium text-red-800">Reject Verification</h4>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason (required)
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            disabled={isPending}
          />
          <div className="flex justify-end mt-3">
            <Button 
              variant="destructive"
              onClick={onReject}
              disabled={isPending || !rejectionReason.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </div>
        </div>
      )}
      
      {activeAction === 'clarify' && (
        <div className="mb-4 border-t pt-4">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
            <h4 className="font-medium text-blue-800">Request Additional Information</h4>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request Details (required)
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            value={clarificationMessage}
            onChange={(e) => setClarificationMessage(e.target.value)}
            placeholder="Specify what additional information you need from the user..."
            disabled={isPending}
          />
          <div className="flex justify-end mt-3">
            <Button 
              onClick={onRequestClarification}
              disabled={isPending || !clarificationMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </div>
      )}
      
      {activeAction === 'approve' && (
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
      )}
      
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={() => setActiveAction(null)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default KycActionPanel;
