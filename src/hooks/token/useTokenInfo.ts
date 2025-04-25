
import { useQuery } from '@tanstack/react-query';
import { fetchTokenInfo } from '@/services/tokenDataService';
import { toast } from "@/components/ui/use-toast";

export const useTokenInfo = () => {
  return useQuery({
    queryKey: ['tokenInfo'],
    queryFn: async () => {
      try {
        console.log('Fetching token info');
        return await fetchTokenInfo();
      } catch (error) {
        console.error('Token info query failed:', error);
        toast({
          title: "Error",
          description: "Could not load token information. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
