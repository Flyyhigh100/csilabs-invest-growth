import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDirectCryptoPayment } from '@/hooks/payments/useDirectCryptoPayment';
import { useCurrentPrice } from '@/hooks/token/useCurrentPrice';
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

const DirectCryptoPaymentTab: React.FC<DirectCryptoPaymentTabProps> = ({ 
  walletAddress, 
  amount
}) => {
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const navigate = useNavigate();
  
  // Get current CSL token price
  const { data: currentTokenPrice, isLoading: isPriceLoading } = useCurrentPrice();
  
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
  } = useDirectCryptoPayment({ tokenPrice: currentTokenPrice });

  // Calculate estimated token amount for display
  const estimatedTokenAmount = currentTokenPrice && currentTokenPrice > 0 ? amount / currentTokenPrice : null;

  const handleCreatePayment = async () => {
    if (amount < 1) {
      toast.error('Minimum amount is $1');
      return;
    }

    if (!currentTokenPrice || currentTokenPrice <= 0) {
      console.warn('No valid token price available for direct crypto payment');
      toast.error('Token price unavailable. Please try again in a moment.');
      return;
    }

    console.log('Creating direct crypto payment with current token price:', {
      amount,
      tokenPrice: currentTokenPrice,
      estimatedTokens: (amount / currentTokenPrice).toFixed(4)
    });

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
    navigate('/dashboard/transactions');
  };

  if (isLoadingAddresses || isPriceLoading) {
    return <LoadingState />;
  }

  if (walletAddresses.length === 0) {
    return <EmptyWalletState />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Show estimated token amount if token price is available */}
      {estimatedTokenAmount && currentTokenPrice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700">
            <p className="font-medium">Estimated CSL Tokens</p>
            <p>
              You'll receive approximately <span className="font-semibold">{estimatedTokenAmount.toFixed(2)} CSL tokens</span> at the current price of ${currentTokenPrice.toFixed(4)} per token.
            </p>
            <p className="text-xs mt-1 text-blue-600">
              This amount will be locked in when your payment is created, protecting you from price changes during processing.
            </p>
          </div>
        </div>
      )}

      {!currentTokenPrice && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm text-amber-700">
            <p className="font-medium">Token Price Loading</p>
            <p>Fetching current CSL token price for accurate estimation...</p>
          </div>
        </div>
      )}

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
          onCopyToClipboard={(text, description) => {
            if (!text) return;
            navigator.clipboard.writeText(text);
            toast.success(`Copied ${description} to clipboard`);
          }}
          onExternalLink={(address) => {
            if (!address) return;
            const url = getExplorerUrl(selectedNetwork, address);
            if (url) {
              window.open(url, '_blank');
            }
          }}
          onBackToOptions={() => setShowPaymentInstructions(false)}
          onNavigateToTransactions={() => navigate('/dashboard/transactions')}
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
