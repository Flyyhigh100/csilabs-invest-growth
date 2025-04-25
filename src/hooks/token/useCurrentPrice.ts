
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentTokenPrice } from '@/services/tokenDataService';
import { toast } from "@/components/ui/use-toast";

export const useCurrentPrice = () => {
  return useQuery({
    queryKey: ['currentTokenPrice'],
    queryFn: async () => {
      try {
        console.log('Fetching current token price');
        return await fetchCurrentTokenPrice();
      } catch (error) {
        console.error('Current price query failed:', error);
        toast({
          title: "Error",
          description: "Could not load current price. Using demo data instead.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
  });
};
