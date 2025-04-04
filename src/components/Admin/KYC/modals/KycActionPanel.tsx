
import React from 'react';
import { Button } from '@/components/ui/button';
import { KycVerificationWithProfile } from '../types';
import KycActionButtons from './components/KycActionButtons';
import KycRejectForm from './components/KycRejectForm';
import KycClarifyForm from './components/KycClarifyForm';
import KycApproveForm from './components/KycApproveForm';
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
  isPending: boolean;
  debugInfo?: {
    lastActionType: string | null;
    lastActionTimestamp: string | null;
    supabaseTriggered: boolean;
    supabaseResponse: any | null;
    error: string | null;
  };
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
  isPending,
  debugInfo
}) => {
  // Only show action panel for pending KYCs
  if (selectedKyc.status !== 'pending') {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Process Verification</h3>
      
      {/* Action buttons for selecting operation type */}
      <KycActionButtons 
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        isPending={isPending}
      />
      
      {/* Debug information panel */}
      <KycDebugInfo 
        selectedKyc={selectedKyc}
        activeAction={activeAction}
        isPending={isPending}
        debugInfo={debugInfo}
      />
      
      {/* Conditional rendering of action forms based on activeAction */}
      {activeAction === 'reject' && (
        <KycRejectForm
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onReject={onReject}
          isPending={isPending}
        />
      )}
      
      {activeAction === 'clarify' && (
        <KycClarifyForm
          clarificationMessage={clarificationMessage}
          setClarificationMessage={setClarificationMessage}
          onRequestClarification={onRequestClarification}
          isPending={isPending}
        />
      )}
      
      {activeAction === 'approve' && (
        <KycApproveForm
          onApprove={onApprove}
          isPending={isPending}
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
