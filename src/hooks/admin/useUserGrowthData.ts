import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from './useTestDataToggle';

interface UserGrowthDataPoint {
  period: string;
  users: number;
  cumulative: number;
}

export const useUserGrowthData = () => {
  const { includeTestData } = useTestDataToggle();

  return useQuery({
    queryKey: ['user-growth-data', includeTestData],
    queryFn: async (): Promise<UserGrowthDataPoint[]> => {
      console.log('Fetching user growth data with includeTestData:', includeTestData);

      // Get user registrations by month from profiles table
      const { data: monthlyData, error } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user growth data:', error);
        throw error;
      }

      if (!monthlyData || monthlyData.length === 0) {
        return [];
      }

      // Group users by month and calculate cumulative growth
      const monthlyGroups: { [key: string]: number } = {};
      
      monthlyData.forEach(profile => {
        if (profile.created_at) {
          const date = new Date(profile.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyGroups[monthKey] = (monthlyGroups[monthKey] || 0) + 1;
        }
      });

      // Convert to array and sort chronologically (left to right)
      const sortedMonths = Object.keys(monthlyGroups).sort();
      
      let cumulative = 0;
      const result: UserGrowthDataPoint[] = sortedMonths.map(month => {
        cumulative += monthlyGroups[month];
        
        // Format month for display (e.g., "2024-01" -> "Jan 2024")
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });

        return {
          period: monthName,
          users: monthlyGroups[month],
          cumulative
        };
      });

      console.log('Generated user growth data:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};