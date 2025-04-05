
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
  
  // Reset fields when modal opens with a new KYC
  useEffect(() => {
    if (open && selectedKyc) {
      // Reset form state when opening with a new KYC
      setRejectionReason('');
      setClarificationMessage('');
      setActiveAction(null);
    }
  }, [open, selectedKyc?.id, setRejectionReason, setClarificationMessage]);

  if (!selectedKyc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
