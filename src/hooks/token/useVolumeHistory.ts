
import { useQuery } from '@tanstack/react-query';
import { fetchTokenVolumeHistory } from '@/services/tokenDataService';
import { toast } from "@/components/ui/use-toast";

export const useVolumeHistory = () => {
  return useQuery({
    queryKey: ['tokenVolumeHistory'],
    queryFn: async () => {
      try {
        console.log('Starting volume history query');
        const result = await fetchTokenVolumeHistory();
        console.log('Volume history query result count:', result.length);
        
        if (result.length === 0) {
          toast({
            title: "Warning",
            description: "No volume history data available for the specified time range.",
            variant: "destructive",
          });
        }
        
        return result;
      } catch (error) {
        console.error('Volume history query failed:', error);
        toast({
          title: "Error",
          description: "Could not load volume history. Using demo data instead.",
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
