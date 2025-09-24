import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LegacyAssetHistoryEntry {
  id: string;
  operation: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  reason: string | null;
  is_admin_action: boolean;
  created_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export const useLegacyAssetHistory = (targetUserId?: string, assetType?: string) => {
  const { user } = useAuth();

  const { 
    data: history, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['legacy-asset-history', targetUserId || user?.id, assetType],
    queryFn: async () => {
      const userId = targetUserId || user?.id;
      if (!userId) return [];
      
      const { data, error } = await supabase.rpc('get_legacy_asset_history', {
        p_user_id: userId,
        p_asset_type: assetType || null
      });
      
      if (error) {
        console.error('Error fetching legacy asset history:', error);
        throw error;
      }
      
      return data as LegacyAssetHistoryEntry[];
    },
    enabled: !!(targetUserId || user?.id),
  });

  // Helper function to format operation names
  const formatOperation = (operation: string): string => {
    switch (operation) {
      case 'legacy_asset_created': return 'Asset Created';
      case 'legacy_asset_updated': return 'Asset Updated';
      case 'legacy_asset_deleted': return 'Asset Deleted';
      default: return operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Helper function to extract meaningful changes
  const getChangeDescription = (entry: LegacyAssetHistoryEntry): string => {
    if (entry.operation === 'legacy_asset_created') {
      const newValues = entry.new_values;
      return `Created ${newValues?.asset_type} with ${newValues?.amount || 0} shares`;
    }
    
    if (entry.operation === 'legacy_asset_updated') {
      const oldValues = entry.old_values;
      const newValues = entry.new_values;
      
      if (oldValues?.amount !== newValues?.amount) {
        return `Updated ${newValues?.asset_type}: ${oldValues?.amount || 0} → ${newValues?.amount || 0} shares`;
      }
      
      return `Updated ${newValues?.asset_type}`;
    }
    
    if (entry.operation === 'legacy_asset_deleted') {
      const oldValues = entry.old_values;
      return `Deleted ${oldValues?.asset_type} (${oldValues?.amount || 0} shares)`;
    }
    
    return 'Unknown change';
  };

  // Helper function to determine if change was significant
  const isSignificantChange = (entry: LegacyAssetHistoryEntry): boolean => {
    if (entry.operation === 'legacy_asset_updated') {
      const oldAmount = parseFloat(entry.old_values?.amount || 0);
      const newAmount = parseFloat(entry.new_values?.amount || 0);
      return Math.abs(oldAmount - newAmount) > 0.01;
    }
    return true; // Creates and deletes are always significant
  };

  return {
    history: history || [],
    isLoading,
    error,
    formatOperation,
    getChangeDescription,
    isSignificantChange
  };
};