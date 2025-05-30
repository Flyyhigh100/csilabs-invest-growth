
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchClientWalletAddresses, 
  createDirectPayment, 
  DirectPaymentRequest,
  ClientWalletAddress 
} from '@/services/directCryptoPaymentService';

export const useDirectCryptoPayment = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<'polygon' | 'solana'>('polygon');
  const [selectedCurrency, setSelectedCurrency] = useState<'USDT' | 'USDC'>('USDC');

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
      toast.success('Payment created successfully', {
        description: 'Please send the exact amount to the provided address'
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

  const createPayment = async (amount: number, userWalletAddress: string) => {
    if (!selectedWalletAddress) {
      toast.error('No wallet address available for selected network and currency');
      return;
    }

    const request: DirectPaymentRequest = {
      amount,
      network: selectedNetwork,
      currency: selectedCurrency,
      wallet_address: userWalletAddress,
    };

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
  };
};
