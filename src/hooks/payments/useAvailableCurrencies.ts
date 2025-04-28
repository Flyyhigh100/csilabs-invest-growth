
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
  fallbackMode?: boolean; // Flag indicating if this is fallback data
}

export const useAvailableCurrencies = () => {
  const [currencies, setCurrencies] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching available currencies from edge function');
      
      const { data, error: fetchError } = await supabase.functions.invoke('get-coinpayments-currencies');
      
      if (fetchError) {
        console.error("Error fetching currencies:", fetchError);
        setError(fetchError.message || 'Failed to fetch currencies');
        toast.error("Failed to load payment options", {
          description: "Please try refreshing or try again later."
        });
        
        // Clear currencies to show problem state
        setCurrencies({});
        return;
      }
      
      if (!data?.currencies) {
        console.error("No currency data received:", data);
        setError('No currency data received');
        setCurrencies({});
        return;
      }
      
      console.log(`Received ${Object.keys(data.currencies).length} currencies from API`);
      
      // Check if we're using fallback data
      const isFallbackData = data.status === 'fallback';
      if (isFallbackData) {
        console.warn("Using fallback currency data due to API issues");
        
        // Mark currencies as fallback mode
        const fallbackCurrencies = Object.entries(data.currencies).reduce((acc, [code, details]: [string, any]) => {
          acc[code] = {
            ...details,
            fallbackMode: true
          };
          return acc;
        }, {} as Record<string, any>);
        
        setCurrencies(fallbackCurrencies);
        return;
      }
      
      // Transform the data into a format for easier use in UI
      const transformedCurrencies = Object.entries(data.currencies).reduce((acc, [code, details]: [string, any]) => {
        acc[code] = {
          code,
          name: `${details.name || code} (${code})`,
          ...details
        };
        return acc;
      }, {} as Record<string, any>);
      
      // Sort currencies: USDT first, then alphabetically
      const sortedCurrencies = Object.fromEntries(
        Object.entries(transformedCurrencies).sort(([codeA], [codeB]) => {
          if (codeA === 'USDT') return -1;
          if (codeB === 'USDT') return 1;
          return codeA.localeCompare(codeB);
        })
      );
      
      setCurrencies(sortedCurrencies);
    } catch (err) {
      console.error("Exception fetching currencies:", err);
      setError((err as Error).message || 'Unexpected error occurred');
      
      // Clear currencies to show problem state
      setCurrencies({});
      
      toast.error("Failed to load payment options", {
        description: "Please try again later or contact support."
      });
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
