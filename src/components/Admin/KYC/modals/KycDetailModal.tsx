
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { KycVerificationWithProfile } from '../types';
import KycModalTabs from './KycModalTabs';
import KycActionPanel from './KycActionPanel';
import { useKycActionHandlers } from '../hooks/useKycActionHandlers';

// Update the props interface to match what's being passed from KycVerificationsDashboard
interface KycDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKyc: KycVerificationWithProfile | null;
  // Add the missing props that are being passed from KycVerificationsDashboard
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  clarificationMessage: string;
  setClarificationMessage: (message: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestClarification: () => void;
  isPending: boolean;
}

const KycDetailModal: React.FC<KycDetailModalProps> = ({
  open,
  onOpenChange,
  selectedKyc,
  // Add the missing props to the component parameters
  rejectionReason,
  setRejectionReason,
  clarificationMessage,
  setClarificationMessage,
  onApprove,
  onReject,
  onRequestClarification,
  isPending
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  // Get debug info from the hook, but we'll use the passed handlers instead
  const { debugInfo, resetDebugInfo } = useKycActionHandlers(() => {});

  // Reset form state when the modal closes or when a new KYC is selected
  useEffect(() => {
    if (open && selectedKyc) {
      setActiveAction(null);
      resetDebugInfo();
    }
  }, [open, selectedKyc?.id, resetDebugInfo]);
  
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
