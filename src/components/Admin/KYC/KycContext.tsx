
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { KycVerificationWithProfile } from './types';

interface KycContextType {
  selectedKyc: KycVerificationWithProfile | null;
  setSelectedKyc: (kyc: KycVerificationWithProfile | null) => void;
  isViewModalOpen: boolean;
  setIsViewModalOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  clarificationMessage: string;
  setClarificationMessage: (message: string) => void;
}

const KycContext = createContext<KycContextType | undefined>(undefined);

export const KycProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedKyc, setSelectedKyc] = useState<KycVerificationWithProfile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');

  return (
    <KycContext.Provider
      value={{
        selectedKyc,
        setSelectedKyc,
        isViewModalOpen,
        setIsViewModalOpen,
        activeTab,
        setActiveTab,
        rejectionReason,
        setRejectionReason,
        clarificationMessage,
        setClarificationMessage,
      }}
    >
      {children}
    </KycContext.Provider>
  );
};

export const useKycContext = (): KycContextType => {
  const context = useContext(KycContext);
  if (context === undefined) {
    throw new Error('useKycContext must be used within a KycProvider');
  }
  return context;
};
