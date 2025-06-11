
import { supabase } from '@/integrations/supabase/client';

export interface GeographicData {
  usersByRegion: Array<{
    region: string;
    users: number;
    percentage: number;
  }>;
  revenueByRegion: Array<{
    region: string;
    revenue: number;
    percentage: number;
  }>;
  complianceByRegion: Array<{
    region: string;
    kycCompleted: number;
    kycPending: number;
    complianceRate: number;
  }>;
}

export const calculateRealGeographicAnalytics = async (includeTestData: boolean = false): Promise<GeographicData> => {
  try {
    // Get user profiles with location data
    const profilesQuery = supabase
      .from('profiles')
      .select('id, state_province, city');

    const { data: profiles } = await profilesQuery;

    // Get transactions for revenue by region
    const transactionsQuery = supabase
      .from('transactions')
      .select('user_id, amount, status');

    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }

    const { data: transactions } = await transactionsQuery;

    // Get KYC data for compliance tracking
    const kycQuery = supabase
      .from('kyc_verifications')
      .select('user_id, status');

    if (!includeTestData) {
      kycQuery.eq('is_test', false);
    }

    const { data: kycData } = await kycQuery;

    if (!profiles || !transactions || !kycData) {
      throw new Error('Failed to fetch geographic data');
    }

    // Map users to regions (using state_province as region)
    const userRegionMap = new Map<string, string>();
    const regionUserCounts = new Map<string, number>();

    profiles.forEach(profile => {
      const region = profile.state_province || 'Unknown';
      userRegionMap.set(profile.id, region);
      regionUserCounts.set(region, (regionUserCounts.get(region) || 0) + 1);
    });

    // Calculate users by region
    const totalUsers = profiles.length;
    const usersByRegion = Array.from(regionUserCounts.entries())
      .map(([region, users]) => ({
        region,
        users,
        percentage: (users / totalUsers) * 100
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10); // Top 10 regions

    // Calculate revenue by region
    const regionRevenue = new Map<string, number>();
    
    transactions
      .filter(tx => tx.status === 'completed')
      .forEach(tx => {
        const region = userRegionMap.get(tx.user_id) || 'Unknown';
        regionRevenue.set(region, (regionRevenue.get(region) || 0) + Number(tx.amount));
      });

    const totalRevenue = Array.from(regionRevenue.values()).reduce((a, b) => a + b, 0);
    const revenueByRegion = Array.from(regionRevenue.entries())
      .map(([region, revenue]) => ({
        region,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate compliance by region
    const regionKyc = new Map<string, { completed: number; pending: number; total: number }>();

    kycData.forEach(kyc => {
      const region = userRegionMap.get(kyc.user_id) || 'Unknown';
      if (!regionKyc.has(region)) {
        regionKyc.set(region, { completed: 0, pending: 0, total: 0 });
      }
      
      const stats = regionKyc.get(region)!;
      stats.total++;
      
      if (kyc.status === 'approved') {
        stats.completed++;
      } else if (kyc.status === 'pending') {
        stats.pending++;
      }
    });

    const complianceByRegion = Array.from(regionKyc.entries())
      .map(([region, stats]) => ({
        region,
        kycCompleted: stats.completed,
        kycPending: stats.pending,
        complianceRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.complianceRate - a.complianceRate)
      .slice(0, 10);

    return {
      usersByRegion,
      revenueByRegion,
      complianceByRegion
    };
  } catch (error) {
    console.error('Error calculating geographic analytics:', error);
    throw error;
  }
};
