
import { useState, useEffect, useCallback } from 'react';

interface PurchaseFlowState {
  isNewToWallet: boolean | null;
  activeSection: 'wallet' | 'funding' | 'purchase';
  sectionsCompleted: {
    wallet: boolean;
    funding: boolean;
    purchase: boolean;
  };
  showCoinPaymentsOptions: boolean;
  isDirectPurchase: boolean; // Flag for direct purchase flow
  needsRender: boolean; // Force re-renders when needed
}

export const usePurchaseFlow = () => {
  const [state, setState] = useState<PurchaseFlowState>({
    isNewToWallet: null,
    activeSection: 'wallet',
    sectionsCompleted: {
      wallet: false,
      funding: false,
      purchase: false
    },
    showCoinPaymentsOptions: false,
    isDirectPurchase: false, // Initialize flag
    needsRender: false
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
        sectionsCompleted: {
          ...prev.sectionsCompleted,
          wallet: true
        }
      }));
    }
    
    if (walletFundingComplete) {
      setState(prev => ({
        ...prev,
        sectionsCompleted: {
          ...prev.sectionsCompleted,
          funding: true
        }
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
    console.log("Setting wallet setup complete");
    localStorage.setItem('walletSetupComplete', 'true');
    
    setState(prev => ({
      ...prev,
      sectionsCompleted: {
        ...prev.sectionsCompleted,
        wallet: true
      },
      needsRender: !prev.needsRender // Toggle to force re-render
    }));
  }, []);

  const markWalletFundingComplete = useCallback(() => {
    console.log("Setting wallet funding complete");
    localStorage.setItem('walletFundingComplete', 'true');
    
    setState(prev => ({
      ...prev,
      sectionsCompleted: {
        ...prev.sectionsCompleted,
        funding: true
      },
      needsRender: !prev.needsRender // Toggle to force re-render
    }));
  }, []);
  
  const markPurchaseComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      sectionsCompleted: {
        ...prev.sectionsCompleted,
        purchase: true
      },
      needsRender: !prev.needsRender
    }));
  }, []);

  const setActiveSection = useCallback((section: 'wallet' | 'funding' | 'purchase') => {
    setState(prev => ({
      ...prev,
      activeSection: section
    }));
  }, []);

  const showCoinPayments = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCoinPaymentsOptions: true
    }));
  }, []);
  
  // Function to set direct purchase flag
  const setDirectPurchase = useCallback((isDirectPurchase: boolean) => {
    console.log("Setting direct purchase flag to:", isDirectPurchase);
    setState(prev => ({
      ...prev,
      isDirectPurchase: isDirectPurchase
    }));
  }, []);

  const resetFlow = useCallback(() => {
    localStorage.removeItem('cryptoExperienceLevel');
    localStorage.removeItem('walletSetupComplete');
    localStorage.removeItem('walletFundingComplete');
    localStorage.removeItem('cryptoOnboardingComplete');
    
    setState({
      isNewToWallet: null,
      activeSection: 'wallet',
      sectionsCompleted: {
        wallet: false,
        funding: false,
        purchase: false
      },
      showCoinPaymentsOptions: false,
      isDirectPurchase: false, // Reset direct purchase flag
      needsRender: false
    });
  }, []);

  return {
    ...state,
    handleOnboardingComplete,
    markWalletSetupComplete,
    markWalletFundingComplete,
    markPurchaseComplete,
    setActiveSection,
    showCoinPayments,
    setDirectPurchase, // Export the function
    resetFlow
  };
};

export default usePurchaseFlow;
