
import React from 'react';
import TokenPriceHeader from './TokenPriceHeader';
import { TokenPriceProvider } from '@/context/TokenPriceContext';

interface TokenPriceHeaderWithProviderProps {
  className?: string;
}

const TokenPriceHeaderWithProvider: React.FC<TokenPriceHeaderWithProviderProps> = ({ className }) => {
  return (
    <TokenPriceProvider>
      <TokenPriceHeader className={className} />
    </TokenPriceProvider>
  );
};

export default TokenPriceHeaderWithProvider;
