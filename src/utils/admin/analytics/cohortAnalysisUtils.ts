
import { supabase } from '@/integrations/supabase/client';

export interface CohortData {
  cohort: string;
  week0: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  totalUsers: number;
}

export const calculateRealCohortAnalysis = async (includeTestData: boolean = false): Promise<CohortData[]> => {
  try {
    // Get all profiles with registration dates
    const profilesQuery = supabase
      .from('profiles')
      .select('id, created_at')
      .order('created_at', { ascending: true });

    const { data: profiles } = await profilesQuery;

    // Get all transactions
    const transactionsQuery = supabase
      .from('transactions')
      .select('user_id, created_at, status');

    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }

    const { data: transactions } = await transactionsQuery;

    if (!profiles || !transactions) {
      throw new Error('Failed to fetch cohort data');
    }

    // Group users by weekly registration cohorts
    const weeklyGroups = new Map<string, string[]>();
    
    profiles.forEach(profile => {
      const registrationDate = new Date(profile.created_at);
      const weekStart = new Date(registrationDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups.has(weekKey)) {
        weeklyGroups.set(weekKey, []);
      }
      weeklyGroups.get(weekKey)!.push(profile.id);
    });

    // Calculate retention for each cohort
    const cohortData: CohortData[] = [];
    const sortedWeeks = Array.from(weeklyGroups.keys()).sort().slice(-8); // Last 8 weeks

    for (const weekKey of sortedWeeks) {
      const cohortUsers = weeklyGroups.get(weekKey)!;
      const cohortStartDate = new Date(weekKey);
      
      // Calculate weekly retention
      const weeklyRetention = [];
      
      for (let week = 0; week < 5; week++) {
        const weekStart = new Date(cohortStartDate);
        weekStart.setDate(weekStart.getDate() + (week * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        // Count users who had transaction activity in this week
        const activeUsers = cohortUsers.filter(userId => {
          return transactions.some(tx => 
            tx.user_id === userId &&
            new Date(tx.created_at) >= weekStart &&
            new Date(tx.created_at) < weekEnd
          );
        });
        
        weeklyRetention.push(activeUsers.length);
      }
      
      const cohortLabel = cohortStartDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      cohortData.push({
        cohort: cohortLabel,
        week0: weeklyRetention[0] || cohortUsers.length, // All users start at 100%
        week1: weeklyRetention[1] || 0,
        week2: weeklyRetention[2] || 0,
        week3: weeklyRetention[3] || 0,
        week4: weeklyRetention[4] || 0,
        totalUsers: cohortUsers.length
      });
    }

    return cohortData.slice(-4); // Return last 4 cohorts
  } catch (error) {
    console.error('Error calculating cohort analysis:', error);
    throw error;
  }
};
