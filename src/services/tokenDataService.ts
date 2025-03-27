
// Service to fetch token data from Defined.fi API
// This file now re-exports functionality from individual service modules

import { TokenPriceData, TokenVolumeData, TokenInfo } from '@/types/token';
import { fetchTokenPriceHistory, fetchCurrentTokenPrice } from './api/priceService';
import { fetchTokenVolumeHistory } from './api/volumeService';
import { fetchTokenInfo } from './api/tokenInfoService';

export {
  fetchTokenPriceHistory,
  fetchTokenVolumeHistory,
  fetchCurrentTokenPrice,
  fetchTokenInfo
};
