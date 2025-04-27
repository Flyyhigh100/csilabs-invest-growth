
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentTokenPrice } from '@/services/api/priceService';
import { toast } from "@/components/ui/use-toast";

export const useCurrentPrice = () => {
  return useQuery({
    queryKey: ['currentTokenPrice'],
    queryFn: async () => {
      try {
        console.log('Fetching current token price from DexScreener');
        return await fetchCurrentTokenPrice();
      } catch (error) {
        console.error('Current price query failed:', error);
        toast({
          title: "Error",
          description: "Could not load current price from DexScreener",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
    retry: 3,
  });
};
