
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Simple cache to avoid frequent API calls
const rateCache: Record<string, { rate: number; timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Gets the current exchange rate for a cryptocurrency to USD
 * @param currency The cryptocurrency code (BTC, ETH, BNB, etc.)
 * @returns The exchange rate (1 CRYPTO = X USD)
 */
export const getCryptoExchangeRate = async (currency: string): Promise<number> => {
  // Check cache first
  const cachedRate = rateCache[currency];
  const now = Date.now();
  
  if (cachedRate && (now - cachedRate.timestamp < CACHE_EXPIRY)) {
    console.log(`Using cached rate for ${currency}: ${cachedRate.rate}`);
    return cachedRate.rate;
  }
  
  try {
    // Call our edge function to get the current rate
    const { data, error } = await supabase.functions.invoke('get-crypto-exchange-rate', {
      body: { currency }
    });
    
    if (error) {
      console.error(`Error fetching ${currency} exchange rate:`, error);
      // Return fallback rates if API fails
      return getFallbackExchangeRate(currency);
    }
    
    if (data && data.rate) {
      // Store in cache
      rateCache[currency] = {
        rate: data.rate,
        timestamp: now
      };
      return data.rate;
    }
    
    // Fallback if no valid data
    return getFallbackExchangeRate(currency);
  } catch (error) {
    console.error(`Exception fetching ${currency} exchange rate:`, error);
    return getFallbackExchangeRate(currency);
  }
};

/**
 * Converts a USD amount to the equivalent cryptocurrency amount
 * @param usdAmount Amount in USD
 * @param currency Target cryptocurrency code
 * @returns The equivalent amount in the target cryptocurrency
 */
export const convertUsdToCrypto = async (usdAmount: number, currency: string): Promise<number> => {
  // For stablecoins, the conversion is 1:1
  if (isStablecoin(currency)) {
    return usdAmount;
  }

  const exchangeRate = await getCryptoExchangeRate(currency);
  
  // Convert USD to crypto (USD / rate)
  // If 1 BTC = 65000 USD, then 1 USD = 1/65000 BTC
  const cryptoAmount = usdAmount / exchangeRate;
  
  return cryptoAmount;
};

/**
 * Determine if a currency is a USD-pegged stablecoin
 */
const isStablecoin = (currency: string): boolean => {
  const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP'];
  return stablecoins.includes(currency.toUpperCase());
};

/**
 * Provides fallback exchange rates when API is unavailable
 * Note: These values will become outdated, but are better than nothing
 */
const getFallbackExchangeRate = (currency: string): number => {
  const fallbackRates: Record<string, number> = {
    'BTC': 66500,
    'ETH': 3200,
    'BNB': 560,
    'DOGE': 0.15,
    'XRP': 0.50,
    'LTCT': 0.01, // Test coins are cheap!
    'USDT': 1,     // Stablecoins
    'USDC': 1
  };
  
  return fallbackRates[currency.toUpperCase()] || 1;
};

/**
 * React hook for currency conversion
 */
export const useCurrencyConverter = (usdAmount: number, currency: string) => {
  const [cryptoAmount, setCryptoAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const performConversion = async () => {
      if (!currency || usdAmount <= 0) {
        setCryptoAmount(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const amount = await convertUsdToCrypto(usdAmount, currency);
        setCryptoAmount(amount);
      } catch (err) {
        setError((err as Error).message || 'Conversion failed');
        setCryptoAmount(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    performConversion();
  }, [usdAmount, currency]);
  
  return { cryptoAmount, isLoading, error };
};
