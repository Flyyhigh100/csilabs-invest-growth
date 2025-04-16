
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CryptoCurrency {
  name: string;
  code: string;
  is_fiat: number;
  rate_btc: string;
  status: string;
  accepted: number;
}

export const useAvailableCurrencies = () => {
  const [currencies, setCurrencies] = useState<CryptoCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-coinpayments-currencies');
      
      if (error) {
        console.error("Error fetching currencies:", error);
        setError(error.message || 'Failed to fetch currencies');
        toast.error("Failed to load payment options", {
          description: "Using default options instead. Please try again later."
        });
        
        // Fall back to default currencies if API fails
        setCurrencies([
          { code: 'USDT', name: 'Tether (USDT)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 },
          { code: 'BTC', name: 'Bitcoin (BTC)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 },
          { code: 'ETH', name: 'Ethereum (ETH)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 },
          { code: 'BNB', name: 'Binance Coin (BNB)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 }
        ]);
        return;
      }
      
      if (!data?.currencies) {
        setError('No currency data received');
        return;
      }
      
      // Transform the data into an array format for easier use in UI
      const currenciesArray = Object.entries(data.currencies).map(([code, details]: [string, any]) => ({
        code,
        name: `${details.name} (${code})`,
        ...details
      }));
      
      // Sort currencies: USDT first, then alphabetically
      const sortedCurrencies = currenciesArray.sort((a, b) => {
        if (a.code === 'USDT') return -1;
        if (b.code === 'USDT') return 1;
        return a.name.localeCompare(b.name);
      });
      
      setCurrencies(sortedCurrencies);
    } catch (err) {
      console.error("Exception fetching currencies:", err);
      setError((err as Error).message || 'Unexpected error occurred');
      
      // Fall back to default currencies
      setCurrencies([
        { code: 'USDT', name: 'Tether (USDT)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 },
        { code: 'BTC', name: 'Bitcoin (BTC)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 },
        { code: 'ETH', name: 'Ethereum (ETH)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 },
        { code: 'BNB', name: 'Binance Coin (BNB)', is_fiat: 0, rate_btc: '0.0', status: 'online', accepted: 1 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  return {
    currencies,
    isLoading,
    error,
    refreshCurrencies: fetchCurrencies
  };
};
