
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentTokenPrice, PriceResult } from '@/services/api/priceService';
import { toast } from "@/components/ui/use-toast";

export const useCurrentPrice = () => {
  return useQuery({
    queryKey: ['currentTokenPrice'],
    queryFn: async (): Promise<number> => {
      try {
        console.log('Fetching current token price');
        const result = await fetchCurrentTokenPrice();
        // Extract just the price value for backward compatibility
        return typeof result === 'number' ? result : result.price;
      } catch (error) {
        console.error('Current price query failed:', error);
        toast({
          title: "Error",
          description: "Could not load current token price",
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
