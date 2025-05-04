
import { useState, useEffect, useCallback } from 'react';

interface PurchaseFlowState {
  isNewToWallet: boolean | null;
  currentStep: number;
  walletSetupComplete: boolean;
  walletFundingComplete: boolean;
  showCoinPaymentsOptions: boolean;
}

export const usePurchaseFlow = () => {
  const [state, setState] = useState<PurchaseFlowState>({
    isNewToWallet: null,
    currentStep: 1,
    walletSetupComplete: false,
    walletFundingComplete: false,
    showCoinPaymentsOptions: false
  });

  // Initialize from localStorage if available
  useEffect(() => {
    const savedExperienceLevel = localStorage.getItem('cryptoExperienceLevel');
    if (savedExperienceLevel) {
      setState(prev => ({
        ...prev,
        isNewToWallet: savedExperienceLevel === 'new'
      }));
    }
    
    const walletSetupComplete = localStorage.getItem('walletSetupComplete') === 'true';
    const walletFundingComplete = localStorage.getItem('walletFundingComplete') === 'true';
    
    if (walletSetupComplete) {
      setState(prev => ({
        ...prev,
        walletSetupComplete: true,
        currentStep: walletFundingComplete ? 3 : 2
      }));
    }
    
    if (walletFundingComplete) {
      setState(prev => ({
        ...prev,
        walletFundingComplete: true,
        currentStep: 3
      }));
    }
  }, []);

  const handleOnboardingComplete = useCallback((isNewUser: boolean) => {
    setState(prev => ({
      ...prev,
      isNewToWallet: isNewUser
    }));
  }, []);

  const markWalletSetupComplete = useCallback(() => {
    localStorage.setItem('walletSetupComplete', 'true');
    setState(prev => ({
      ...prev,
      walletSetupComplete: true,
      currentStep: 2
    }));
  }, []);

  const markWalletFundingComplete = useCallback(() => {
    localStorage.setItem('walletFundingComplete', 'true');
    setState(prev => ({
      ...prev,
      walletFundingComplete: true,
      currentStep: 3
    }));
  }, []);

  const showCoinPayments = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCoinPaymentsOptions: true
    }));
  }, []);

  const resetFlow = useCallback(() => {
    localStorage.removeItem('cryptoExperienceLevel');
    localStorage.removeItem('walletSetupComplete');
    localStorage.removeItem('walletFundingComplete');
    localStorage.removeItem('cryptoOnboardingComplete');
    
    setState({
      isNewToWallet: null,
      currentStep: 1,
      walletSetupComplete: false,
      walletFundingComplete: false,
      showCoinPaymentsOptions: false
    });
  }, []);

  return {
    ...state,
    handleOnboardingComplete,
    markWalletSetupComplete,
    markWalletFundingComplete,
    showCoinPayments,
    resetFlow
  };
};

export default usePurchaseFlow;
