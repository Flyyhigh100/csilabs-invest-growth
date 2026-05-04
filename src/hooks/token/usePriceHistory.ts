import { useQuery } from '@tanstack/react-query';

// Price history disabled — token price is locked at a static value.
export const usePriceHistory = () => {
  return useQuery({
    queryKey: ['tokenPriceHistory'],
    queryFn: async () => [] as Array<{ date: string; price: number }>,
    staleTime: Infinity,
  });
};
