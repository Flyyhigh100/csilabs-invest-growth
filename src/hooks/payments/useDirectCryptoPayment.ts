
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchClientWalletAddresses, 
  createDirectPayment, 
  DirectPaymentRequest,
  ClientWalletAddress 
} from '@/services/directCryptoPaymentService';

interface UseDirectCryptoPaymentProps {
  tokenPrice?: number; // Current CSL token price
}

export const useDirectCryptoPayment = (props: UseDirectCryptoPaymentProps = {}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<'polygon' | 'solana' | 'ethereum' | 'binance-smart-chain' | 'bitcoin'>('polygon');
  const [selectedCurrency, setSelectedCurrency] = useState<'USDT' | 'USDC' | 'ETH' | 'BNB' | 'BTC' | 'SOL' | 'POL'>('USDC');

  // Fetch available wallet addresses
  const { 
    data: walletAddresses = [], 
    isLoading: isLoadingAddresses,
    error: addressesError 
  } = useQuery({
    queryKey: ['client-wallet-addresses'],
    queryFn: fetchClientWalletAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: createDirectPayment,
    onSuccess: (data) => {
      const tokenInfo = data.estimated_token_amount 
        ? ` You'll receive approximately ${data.estimated_token_amount.toFixed(2)} CSL tokens.`
        : '';
      
      toast.success('Payment created successfully', {
        description: `Please send the exact amount to the provided address.${tokenInfo}`
      });
    },
    onError: (error: Error) => {
      console.error('Payment creation failed:', error);
      toast.error('Failed to create payment', {
        description: error.message
      });
    },
  });

  // Get selected wallet address
  const selectedWalletAddress = walletAddresses.find(
    addr => addr.network === selectedNetwork && addr.currency === selectedCurrency
  );

  // Available networks and currencies
  const availableNetworks = [...new Set(walletAddresses.map(addr => addr.network))];
  const availableCurrencies = [...new Set(
    walletAddresses
      .filter(addr => addr.network === selectedNetwork)
      .map(addr => addr.currency)
  )];

  // Helper function to get network display name
  const getNetworkDisplayName = (network: string): string => {
    const networkNames: Record<string, string> = {
      'polygon': 'Polygon',
      'solana': 'Solana',
      'ethereum': 'Ethereum',
      'binance-smart-chain': 'BNB Smart Chain',
      'bitcoin': 'Bitcoin'
    };
    return networkNames[network] || network;
  };

  // Helper function to get blockchain explorer URL
  const getExplorerUrl = (network: string, address: string): string => {
    const explorers: Record<string, string> = {
      'polygon': `https://polygonscan.com/address/${address}`,
      'solana': `https://solscan.io/account/${address}`,
      'ethereum': `https://etherscan.io/address/${address}`,
      'binance-smart-chain': `https://bscscan.com/address/${address}`,
      'bitcoin': `https://blockchair.com/bitcoin/address/${address}`
    };
    return explorers[network] || '';
  };

  // Check if currency is a stablecoin
  const isStablecoin = (currency: string): boolean => {
    return ['USDT', 'USDC'].includes(currency);
  };

  const createPayment = async (amount: number, userWalletAddress: string) => {
    if (!selectedWalletAddress) {
      toast.error('No wallet address available for selected network and currency');
      return;
    }

    // Ensure we have a token price for calculations
    const currentTokenPrice = props.tokenPrice;
    if (!currentTokenPrice || currentTokenPrice <= 0) {
      console.warn('Token price not available for direct crypto payment, proceeding without estimation');
    }

    const request: DirectPaymentRequest = {
      amount,
      network: selectedNetwork,
      currency: selectedCurrency,
      wallet_address: userWalletAddress,
      token_price: currentTokenPrice // Pass the current CSL token price
    };

    console.log('Creating direct crypto payment with token price:', {
      amount,
      currency: selectedCurrency,
      network: selectedNetwork,
      tokenPrice: currentTokenPrice,
      estimatedTokens: currentTokenPrice ? (amount / currentTokenPrice).toFixed(2) : 'N/A'
    });

    return createPaymentMutation.mutateAsync(request);
  };

  return {
    // State
    selectedNetwork,
    selectedCurrency,
    selectedWalletAddress,
    
    // Data
    walletAddresses,
    availableNetworks,
    availableCurrencies,
    
    // Loading states
    isLoadingAddresses,
    isCreatingPayment: createPaymentMutation.isPending,
    
    // Errors
    addressesError,
    paymentError: createPaymentMutation.error,
    
    // Actions
    setSelectedNetwork,
    setSelectedCurrency,
    createPayment,
    
    // Results
    paymentResult: createPaymentMutation.data,
    
    // Helper functions
    getNetworkDisplayName,
    getExplorerUrl,
    isStablecoin,
  };
};
