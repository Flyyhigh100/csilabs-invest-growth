
import React from 'react';
import { TokenInfo as TokenInfoType } from '@/types/token';

interface TokenInfoProps {
  tokenInfo: TokenInfoType | null;
  isLoading: boolean;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ tokenInfo, isLoading }) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 max-w-full mx-auto">
      <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-600 text-sm sm:text-base">Total Supply:</span>
        <span className="font-medium text-sm sm:text-base">{tokenInfo ? tokenInfo.totalSupply : 'Loading...'} CSL</span>
      </div>
      <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-600 text-sm sm:text-base">Blockchain:</span>
        <span className="font-medium text-sm sm:text-base">{tokenInfo ? tokenInfo.blockchain : 'Loading...'}</span>
      </div>
      <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600 text-sm sm:text-base">Contract:</span>
        </div>
        <div className="text-gray-700 text-xs font-mono break-all overflow-hidden">
          {tokenInfo ? tokenInfo.contractAddress : 'Loading...'}
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
