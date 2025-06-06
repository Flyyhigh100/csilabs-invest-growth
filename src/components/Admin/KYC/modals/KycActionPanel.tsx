
import React from 'react';
import { Button } from '@/components/ui/button';
import { KycVerificationWithProfile } from '../types';
import KycActionButtons from './components/KycActionButtons';
import KycRejectForm from './components/KycRejectForm';
import KycClarifyForm from './components/KycClarifyForm';
import KycApproveForm from './components/KycApproveForm';
import KycResendEmailForm from './components/KycResendEmailForm';
import KycDebugInfo from './components/KycDebugInfo';

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
  onResendEmail?: () => void;
  isPending: boolean;
  debugInfo?: {
    lastActionType: string | null;
    lastActionTimestamp: string | null;
    supabaseTriggered: boolean;
    supabaseResponse: any | null;
    error: string | null;
  };
  lastEmailSentStatus?: {
    success: boolean;
    timestamp: string | null;
    error?: string;
  } | null;
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
  onResendEmail,
  isPending,
  debugInfo,
  lastEmailSentStatus
}) => {
  // Show action buttons for all KYCs (not just pending ones)
  // But only show processing buttons for pending KYCs
  const showProcessingButtons = selectedKyc.status === 'pending';
  
  // Show resend email button for all KYCs that have been processed
  const showResendEmailButton = selectedKyc.status !== 'not_started' && selectedKyc.status !== 'pending';

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">
        {showProcessingButtons ? 'Process Verification' : 'KYC Actions'}
      </h3>
      
      {/* Action buttons for selecting operation type */}
      <KycActionButtons 
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        isPending={isPending}
        showResendEmail={showResendEmailButton}
      />
      
      {/* Debug information panel */}
      <KycDebugInfo 
        selectedKyc={selectedKyc}
        activeAction={activeAction}
        isPending={isPending}
        debugInfo={debugInfo}
      />
      
      {/* Conditional rendering of action forms based on activeAction */}
      {showProcessingButtons && activeAction === 'reject' && (
        <KycRejectForm
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onReject={onReject}
          isPending={isPending}
        />
      )}
      
      {showProcessingButtons && activeAction === 'clarify' && (
        <KycClarifyForm
          clarificationMessage={clarificationMessage}
          setClarificationMessage={setClarificationMessage}
          onRequestClarification={onRequestClarification}
          isPending={isPending}
        />
      )}
      
      {showProcessingButtons && activeAction === 'approve' && (
        <KycApproveForm
          onApprove={onApprove}
          isPending={isPending}
        />
      )}
      
      {/* Resend email form - available for processed KYCs */}
      {activeAction === 'resend' && onResendEmail && (
        <KycResendEmailForm
          onResendEmail={onResendEmail}
          isPending={isPending}
          lastSentStatus={lastEmailSentStatus}
        />
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
