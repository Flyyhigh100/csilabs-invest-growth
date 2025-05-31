
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDirectCryptoPayment } from '@/hooks/payments/useDirectCryptoPayment';
import { toast } from 'sonner';
import PaymentConfigurationForm from './DirectCrypto/PaymentConfigurationForm';
import PaymentInstructionsCard from './DirectCrypto/PaymentInstructionsCard';
import PaymentNotesSection from './DirectCrypto/PaymentNotesSection';
import EmptyWalletState from './DirectCrypto/EmptyWalletState';
import LoadingState from './DirectCrypto/LoadingState';

interface DirectCryptoPaymentTabProps {
  walletAddress: string;
  amount: number;
}

const DirectCryptoPaymentTab: React.FC<DirectCryptoPaymentTabProps> = ({ walletAddress, amount }) => {
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const navigate = useNavigate();
  
  const {
    selectedNetwork,
    selectedCurrency,
    availableNetworks,
    availableCurrencies,
    walletAddresses,
    isLoadingAddresses,
    isCreatingPayment,
    setSelectedNetwork,
    setSelectedCurrency,
    createPayment,
    paymentResult,
    getNetworkDisplayName,
    getExplorerUrl,
    isStablecoin
  } = useDirectCryptoPayment();

  const handleCreatePayment = async () => {
    if (amount < 1) {
      toast.error('Minimum amount is $1');
      return;
    }

    try {
      const result = await createPayment(amount, walletAddress);
      if (result) {
        setShowPaymentInstructions(true);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const copyToClipboard = (text: string | undefined, description: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${description} to clipboard`);
  };

  const handleExternalLink = (address: string | undefined) => {
    if (!address) return;
    
    const url = getExplorerUrl(selectedNetwork, address);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleNavigateToTransactions = () => {
    navigate('/transactions');
  };

  if (isLoadingAddresses) {
    return <LoadingState />;
  }

  if (walletAddresses.length === 0) {
    return <EmptyWalletState />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {!showPaymentInstructions ? (
        <>
          <PaymentConfigurationForm
            amount={amount}
            selectedNetwork={selectedNetwork}
            selectedCurrency={selectedCurrency}
            availableNetworks={availableNetworks}
            availableCurrencies={availableCurrencies}
            isCreatingPayment={isCreatingPayment}
            onNetworkChange={(value) => setSelectedNetwork(value as any)}
            onCurrencyChange={(value) => setSelectedCurrency(value as any)}
            onCreatePayment={handleCreatePayment}
            getNetworkDisplayName={getNetworkDisplayName}
            isStablecoin={isStablecoin}
          />
        </>
      ) : (
        <PaymentInstructionsCard
          amount={amount}
          paymentResult={paymentResult}
          onCopyToClipboard={copyToClipboard}
          onExternalLink={handleExternalLink}
          onBackToOptions={() => setShowPaymentInstructions(false)}
          onNavigateToTransactions={handleNavigateToTransactions}
          getNetworkDisplayName={getNetworkDisplayName}
        />
      )}
      
      <PaymentNotesSection
        selectedCurrency={selectedCurrency}
        selectedNetwork={selectedNetwork}
        getNetworkDisplayName={getNetworkDisplayName}
        isStablecoin={isStablecoin}
      />
    </div>
  );
};

export default DirectCryptoPaymentTab;
