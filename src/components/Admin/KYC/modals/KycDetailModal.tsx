
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { KycVerificationWithProfile } from '../types';
import KycModalTabs from './KycModalTabs';
import KycActionPanel from './KycActionPanel';

interface KycDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKyc: KycVerificationWithProfile | null;
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
    retryAttempts?: number;
    currentRetry?: number | null;
    adminPermissionStatus?: 'verified' | 'failed' | 'checking' | null;
  };
}

const KycDetailModal: React.FC<KycDetailModalProps> = ({
  open,
  onOpenChange,
  selectedKyc,
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
  const [activeTab, setActiveTab] = useState<string>('info');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  // Reset form state when the modal closes or when a new KYC is selected
  useEffect(() => {
    if (open && selectedKyc) {
      setRejectionReason('');
      setClarificationMessage('');
      setActiveAction(null);
    }
  }, [open, selectedKyc?.id, setRejectionReason, setClarificationMessage]);
  
  // Reset action panel if the operation succeeds or fails
  useEffect(() => {
    if (!isPending && debugInfo?.supabaseResponse?.success) {
      setActiveAction(null);
    }
  }, [isPending, debugInfo?.supabaseResponse?.success]);

  if (!selectedKyc) return null;
  
  // Handle closing modal - ensure we reset state if the modal is closed
  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      setActiveAction(null);
      setRejectionReason('');
      setClarificationMessage('');
    }
    onOpenChange(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Verification Details</DialogTitle>
          <DialogDescription>
            Review user information and documents
          </DialogDescription>
        </DialogHeader>
        
        <KycModalTabs
          selectedKyc={selectedKyc}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <KycActionPanel
          selectedKyc={selectedKyc}
          activeAction={activeAction}
          setActiveAction={setActiveAction}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          clarificationMessage={clarificationMessage}
          setClarificationMessage={setClarificationMessage}
          onApprove={onApprove}
          onReject={onReject}
          onRequestClarification={onRequestClarification}
          isPending={isPending}
          debugInfo={debugInfo}
        />
      </DialogContent>
    </Dialog>
  );
};

export default KycDetailModal;
