
import React, { useEffect, useState } from 'react';
import { useKycContext } from '../KycContext';
import { useKycActionHandlers } from '../KycActionHandlers';
import { toast } from 'sonner';
import KycDetailModal from '../modals/KycDetailModal';
import KycDashboardHeader from './KycDashboardHeader';
import KycVerificationsContainer from './KycVerificationsContainer';
import { useQuery } from '@tanstack/react-query';
import { verifyAdminAccess, listAllUsersWithKycStatus } from '../KycVerificationsService';
import { useAdminKycDataFetcher } from './hooks/useAdminKycDataFetcher';
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
  
  // Admin access state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Custom hook for fetching KYC data
  const {
    kycVerifications,
    isLoading,
    error,
    showAllUsers,
    setShowAllUsers,
    allUsersWithKyc,
    handleManualRefresh,
    refetch
  } = useAdminKycDataFetcher(isAdmin);
  
  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      const isAdminUser = await verifyAdminAccess();
      setIsAdmin(isAdminUser);
      if (!isAdminUser) {
        toast.error('You do not have admin permissions to view KYC verifications');
      } else {
        toast.success('Admin access verified - you can view all KYC submissions');
      }
    };
    
    checkAdminAccess();
  }, []);
  
  // Fetch all users with KYC status
  useEffect(() => {
    // Force immediate data fetch when component mounts
    if (isAdmin) {
      handleManualRefresh();
    }
    
    // Clear messages when modal is closed
    if (!isViewModalOpen) {
      setRejectionReason('');
      setClarificationMessage('');
    }
  }, [isViewModalOpen, isAdmin]);
  
  const handleViewDetails = (kyc: typeof selectedKyc) => {
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  if (isAdmin === false) {
    return <AccessDeniedMessage onRetryAccess={handleManualRefresh} />;
  }
  
  return (
    <div className="space-y-6">
      <KycDashboardHeader 
        onManualRefresh={handleManualRefresh}
        onDirectDatabaseTest={() => {}}
        refetch={refetch}
        onToggleShowAllUsers={() => setShowAllUsers(!showAllUsers)}
        showAllUsers={showAllUsers}
      />
      
      {showAllUsers && allUsersWithKyc.length > 0 && (
        <KycAllUsersTable allUsersWithKyc={allUsersWithKyc} />
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
