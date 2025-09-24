import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from './useTestDataToggle';

interface VolumeDataPoint {
  period: string;
  volume: number;
  transactions: number;
}

export const useTransactionVolumeData = () => {
  const { includeTestData } = useTestDataToggle();

  return useQuery({
    queryKey: ['transaction-volume-data', includeTestData],
    queryFn: async (): Promise<VolumeDataPoint[]> => {
      console.log('Fetching transaction volume data with includeTestData:', includeTestData);

      let query = supabase
        .from('transactions')
        .select('created_at, amount, status')
        .order('created_at', { ascending: true });

      // Filter test data if needed
      if (!includeTestData) {
        query = query.eq('is_test', false);
      }

      const { data: transactions, error } = await query;

      if (error) {
        console.error('Error fetching transaction volume data:', error);
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        return [];
      }

      // Group transactions by month
      const monthlyGroups: { [key: string]: { volume: number; count: number } } = {};
      
      transactions.forEach(transaction => {
        if (transaction.created_at && transaction.amount && transaction.status === 'completed') {
          const date = new Date(transaction.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyGroups[monthKey]) {
            monthlyGroups[monthKey] = { volume: 0, count: 0 };
          }
          
          monthlyGroups[monthKey].volume += Number(transaction.amount);
          monthlyGroups[monthKey].count += 1;
        }
      });

      // Convert to array and sort chronologically (left to right)
      const sortedMonths = Object.keys(monthlyGroups).sort();
      
      const result: VolumeDataPoint[] = sortedMonths.map(month => {
        const { volume, count } = monthlyGroups[month];
        
        // Format month for display
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });

        return {
          period: monthName,
          volume: Math.round(volume * 100) / 100, // Round to 2 decimal places
          transactions: count
        };
      });

      console.log('Generated transaction volume data:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};