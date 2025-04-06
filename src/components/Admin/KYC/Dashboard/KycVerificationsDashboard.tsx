import React, { useEffect } from 'react';
import { useKycContext } from '../KycContext';
import { useKycActionHandlers } from '../hooks/useKycActionHandlers';
import { toast } from 'sonner';
import KycDetailModal from '../modals/KycDetailModal';
import KycDashboardHeader from './KycDashboardHeader';
import KycVerificationsContainer from './KycVerificationsContainer';
import { useAdminKycDataFetcher } from './hooks';
import AccessDeniedMessage from './components/AccessDeniedMessage';
import KycAllUsersTable from './components/KycAllUsersTable';

const KycVerificationsDashboard: React.FC = () => {
  // Context hooks
  const {
    selectedKyc,
    setSelectedKyc,
    isViewModalOpen,
    setIsViewModalOpen,
    activeTab,
    setActiveTab,
    rejectionReason,
    setRejectionReason,
    clarificationMessage,
    setClarificationMessage
  } = useKycContext();
  
  // Action handlers
  const { 
    handleApprove, 
    handleReject, 
    handleRequestClarification, 
    isPending
  } = useKycActionHandlers(() => setIsViewModalOpen(false));
  
  // Custom hook for fetching KYC data
  const {
    kycVerifications,
    isLoading,
    error,
    showAllUsers,
    setShowAllUsers,
    allUsersWithKyc,
    handleManualRefresh,
    refetch,
    isAdmin
  } = useAdminKycDataFetcher();
  
  // Force immediate data fetch when component mounts
  useEffect(() => {
    if (isAdmin) {
      refetch();
    }
    
    // Clear messages when modal is closed
    if (!isViewModalOpen) {
      setRejectionReason('');
      setClarificationMessage('');
    }
  }, [isViewModalOpen, isAdmin, refetch, setRejectionReason, setClarificationMessage]);
  
  const handleViewDetails = (kyc: typeof selectedKyc) => {
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  if (isAdmin === false) {
    return <AccessDeniedMessage onRetryAccess={handleManualRefresh} />;
  }
  
  // Ensure allUsersWithKyc is always an array to prevent "length does not exist on type 'unknown'" error
  const safeAllUsersWithKyc = Array.isArray(allUsersWithKyc) ? allUsersWithKyc : [];
  
  return (
    <div className="space-y-6">
      <KycDashboardHeader 
        onManualRefresh={handleManualRefresh}
        onDirectDatabaseTest={() => {}}
        refetch={refetch}
        onToggleShowAllUsers={() => setShowAllUsers(!showAllUsers)}
        showAllUsers={showAllUsers}
      />
      
      {showAllUsers && safeAllUsersWithKyc.length > 0 && (
        <KycAllUsersTable allUsersWithKyc={safeAllUsersWithKyc} />
      )}
      
      <KycVerificationsContainer
        kycVerifications={kycVerifications}
        isLoading={isLoading}
        error={error}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onViewDetails={handleViewDetails}
        refetch={refetch}
      />
      
      <KycDetailModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        selectedKyc={selectedKyc}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        clarificationMessage={clarificationMessage}
        setClarificationMessage={setClarificationMessage}
        onApprove={() => handleApprove(selectedKyc)}
        onReject={() => handleReject(selectedKyc, rejectionReason)}
        onRequestClarification={() => handleRequestClarification(selectedKyc, clarificationMessage)}
        isPending={isPending}
      />
    </div>
  );
};

export default KycVerificationsDashboard;
