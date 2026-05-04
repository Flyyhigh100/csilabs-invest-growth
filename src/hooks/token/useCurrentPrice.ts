import { useQuery } from '@tanstack/react-query';
import { STATIC_TOKEN_PRICE } from '@/services/api/staticPrice';

export const useCurrentPrice = () => {
  return useQuery({
    queryKey: ['currentTokenPrice'],
    queryFn: async (): Promise<number> => STATIC_TOKEN_PRICE,
    staleTime: Infinity,
  });
};
