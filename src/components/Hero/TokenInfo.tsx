
import React from 'react';
import { TokenInfo as TokenInfoType } from '@/types/token';

interface TokenInfoProps {
  tokenInfo: TokenInfoType | null;
  isLoading: boolean;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenInfo, isLoading }) => {
  return (
    <div className="flex flex-col gap-4 max-w-full mx-auto mt-6">
      <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-600">Total Supply:</span>
        <span className="font-medium">{tokenInfo ? tokenInfo.totalSupply : 'Loading...'} CSL</span>
      </div>
      <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-600">Blockchain:</span>
        <span className="font-medium">{tokenInfo ? tokenInfo.blockchain : 'Loading...'}</span>
      </div>
      <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Contract:</span>
        </div>
        <div className="text-gray-700 text-xs font-mono break-all overflow-hidden">
          {tokenInfo ? tokenInfo.contractAddress : 'Loading...'}
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
