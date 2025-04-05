
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { KycVerificationWithProfile } from '../types';
import KycModalTabs from './KycModalTabs';
import KycActionPanel from './KycActionPanel';
import { useKycActionHandlers } from '../hooks/useKycActionHandlers';

interface KycDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedKyc: KycVerificationWithProfile | null;
}

const KycDetailModal: React.FC<KycDetailModalProps> = ({
  open,
  onOpenChange,
  selectedKyc
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');
  
  // Handle modal close
  const handleCloseModal = () => {
    setActiveAction(null);
    setRejectionReason('');
    setClarificationMessage('');
    onOpenChange(false);
  };
  
  // Define KYC action handlers
  const { 
    handleApprove, 
    handleReject, 
    handleRequestClarification, 
    isPending, 
    debugInfo,
    resetDebugInfo
  } = useKycActionHandlers(handleCloseModal);

  // Reset form state when the modal closes or when a new KYC is selected
  useEffect(() => {
    if (open && selectedKyc) {
      setRejectionReason('');
      setClarificationMessage('');
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
      setRejectionReason('');
      setClarificationMessage('');
    }
    onOpenChange(newOpenState);
  };
  
  // Action handlers
  const onApprove = () => {
    handleApprove(selectedKyc);
  };
  
  const onReject = () => {
    handleReject(selectedKyc, rejectionReason);
  };
  
  const onRequestClarification = () => {
    handleRequestClarification(selectedKyc, clarificationMessage);
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
