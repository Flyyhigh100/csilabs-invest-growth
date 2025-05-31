
import { supabase } from '@/integrations/supabase/client';

export interface ClientWalletAddress {
  id: string;
  network: 'polygon' | 'solana' | 'ethereum' | 'binance-smart-chain' | 'bitcoin';
  currency: 'USDT' | 'USDC' | 'ETH' | 'BNB' | 'BTC' | 'SOL' | 'POL';
  wallet_address: string;
  is_active: boolean;
}

export interface DirectPaymentRequest {
  amount: number;
  network: 'polygon' | 'solana' | 'ethereum' | 'binance-smart-chain' | 'bitcoin';
  currency: 'USDT' | 'USDC' | 'ETH' | 'BNB' | 'BTC' | 'SOL' | 'POL';
  wallet_address: string;
}

export interface DirectPaymentResponse {
  transaction_id: string;
  payment_address: string;
  expected_crypto_amount: number;
  timeout_at: string;
  network: string;
  currency: string;
}

/**
 * Fetch active client wallet addresses for direct crypto payments
 */
export const fetchClientWalletAddresses = async (): Promise<ClientWalletAddress[]> => {
  const { data, error } = await supabase
    .from('client_wallet_addresses')
    .select('*')
    .eq('is_active', true)
    .order('network', { ascending: true })
    .order('currency', { ascending: true });

  if (error) {
    console.error('Error fetching client wallet addresses:', error);
    throw new Error(`Failed to fetch wallet addresses: ${error.message}`);
  }

  // Type cast to ensure proper TypeScript types
  return (data || []).map(item => ({
    id: item.id,
    network: item.network as 'polygon' | 'solana' | 'ethereum' | 'binance-smart-chain' | 'bitcoin',
    currency: item.currency as 'USDT' | 'USDC' | 'ETH' | 'BNB' | 'BTC' | 'SOL' | 'POL',
    wallet_address: item.wallet_address,
    is_active: item.is_active
  }));
};

/**
 * Create a direct crypto payment transaction
 */
export const createDirectPayment = async (request: DirectPaymentRequest): Promise<DirectPaymentResponse> => {
  try {
    console.log('Creating direct crypto payment:', request);
    
    const { data, error } = await supabase.functions.invoke('create-direct-crypto-payment', {
      body: request
    });

    if (error) {
      console.error('Error creating direct payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to create payment');
    }

    return data.payment;
  } catch (error) {
    console.error('Error in createDirectPayment:', error);
    throw error;
  }
};
