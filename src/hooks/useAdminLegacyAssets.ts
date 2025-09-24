import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LegacyAssetType } from './useLegacyAssets';
import { auditLogger } from '@/utils/security/auditLogger';

export interface AdminLegacyAsset {
  id: string;
  user_id: string;
  asset_type: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export const useAdminLegacyAssets = (targetUserId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch legacy assets for a specific user (admin only)
  const { 
    data: legacyAssets, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['admin-legacy-assets', targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId) return [];
      
      const { data, error } = await supabase
        .from('user_legacy_assets')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching admin legacy assets:', error);
        throw error;
      }
      
      return data as AdminLegacyAsset[];
    },
    enabled: !!user && !!targetUserId,
  });

  // Update/Create asset for any user (admin only)
  const updateAsset = useMutation({
    mutationFn: async ({ 
      userId, 
      assetType, 
      amount,
      reason 
    }: { 
      userId: string; 
      assetType: LegacyAssetType; 
      amount: number;
      reason?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get the old value for audit logging
      const { data: oldData } = await supabase
        .from('user_legacy_assets')
        .select('*')
        .eq('user_id', userId)
        .eq('asset_type', assetType)
        .single();

      const { data, error } = await supabase
        .from('user_legacy_assets')
        .upsert({
          user_id: userId,
          asset_type: assetType,
          amount: amount,
        }, {
          onConflict: 'user_id,asset_type'
        })
        .select()
        .single();

      if (error) throw error;

      // Log the admin action with enhanced audit information
      await auditLogger.logAdminOperation('legacy_asset_admin_update', {
        targetUserId: userId,
        assetType,
        oldAmount: oldData?.amount || 0,
        newAmount: amount,
        reason: reason || 'Admin adjustment'
      });

      // If reason was provided, add it to the audit log in the database
      if (reason) {
        await supabase.rpc('log_admin_action', {
          p_operation: 'admin_legacy_asset_update',
          p_table_name: 'user_legacy_assets',
          p_record_id: data.id,
          p_old_values: oldData ? JSON.stringify(oldData) : null,
          p_new_values: JSON.stringify(data)
        });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-legacy-assets', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['legacy-assets', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-legacy-assets'] }); // Refresh main admin page
      toast({
        title: "Success",
        description: "Legacy asset updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating admin legacy asset:', error);
      toast({
        title: "Error",
        description: "Failed to update legacy asset",
        variant: "destructive",
      });
    }
  });

  // Delete asset for any user (admin only)
  const deleteAsset = useMutation({
    mutationFn: async ({ 
      userId, 
      assetType,
      reason 
    }: { 
      userId: string; 
      assetType: LegacyAssetType;
      reason?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get the data before deletion for audit logging
      const { data: oldData } = await supabase
        .from('user_legacy_assets')
        .select('*')
        .eq('user_id', userId)
        .eq('asset_type', assetType)
        .single();

      const { error } = await supabase
        .from('user_legacy_assets')
        .delete()
        .eq('user_id', userId)
        .eq('asset_type', assetType);

      if (error) throw error;

      // Log the admin deletion
      await auditLogger.logAdminOperation('legacy_asset_admin_delete', {
        targetUserId: userId,
        assetType,
        deletedAmount: oldData?.amount || 0,
        reason: reason || 'Admin removal'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-legacy-assets', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['legacy-assets', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-legacy-assets'] }); // Refresh main admin page
      toast({
        title: "Success", 
        description: "Legacy asset removed successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting admin legacy asset:', error);
      toast({
        title: "Error",
        description: "Failed to remove legacy asset",
        variant: "destructive",
      });
    }
  });

  // Helper function to get asset amount by type for target user
  const getAssetAmount = (assetType: LegacyAssetType): number => {
    const asset = legacyAssets?.find(a => a.asset_type === assetType);
    return asset?.amount || 0;
  };

  // Helper function to get total asset count for target user
  const getTotalAssetCount = (): number => {
    return legacyAssets?.reduce((total, asset) => total + asset.amount, 0) || 0;
  };

  return {
    legacyAssets: legacyAssets || [],
    isLoading,
    error,
    updateAsset,
    deleteAsset,
    getAssetAmount,
    getTotalAssetCount
  };
};