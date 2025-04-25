
import { useQuery } from '@tanstack/react-query';
import { fetchTokenPriceHistory } from '@/services/tokenDataService';
import { toast } from "@/components/ui/use-toast";

export const usePriceHistory = () => {
  return useQuery({
    queryKey: ['tokenPriceHistory'],
    queryFn: async () => {
      try {
        console.log('Starting price history query');
        const result = await fetchTokenPriceHistory();
        console.log('Price history query result count:', result.length);
        
        if (result.length === 0) {
          toast({
            title: "Warning",
            description: "No price history data available for the specified time range.",
            variant: "destructive",
          });
        }
        
        return result;
      } catch (error) {
        console.error('Price history query failed:', error);
        toast({
          title: "Error",
          description: "Could not load price history. Using demo data instead.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
