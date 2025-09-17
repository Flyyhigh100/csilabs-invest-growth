import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface LegacyAsset {
  id: string;
  user_id: string;
  asset_type: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export const LEGACY_ASSET_TYPES = [
  'CBIS Original Shares',
  'CBIS-GIFT Shares', 
  'CBIS-First Rights Shares (ENDO)',
  'CSi-VIP Shares',
  'CSi-VIP Award Shares',
  'CSi-Management/Partner Shares'
] as const;

export type LegacyAssetType = typeof LEGACY_ASSET_TYPES[number];

export const useLegacyAssets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data: legacyAssets, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['legacy-assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_legacy_assets')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching legacy assets:', error);
        throw error;
      }
      
      return data as LegacyAsset[];
    },
    enabled: !!user,
  });

  const updateAsset = useMutation({
    mutationFn: async ({ assetType, amount }: { assetType: LegacyAssetType; amount: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_legacy_assets')
        .upsert({
          user_id: user.id,
          asset_type: assetType,
          amount: amount,
        }, {
          onConflict: 'user_id,asset_type'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-assets', user?.id] });
      toast({
        title: "Success",
        description: "Legacy asset updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating legacy asset:', error);
      toast({
        title: "Error",
        description: "Failed to update legacy asset",
        variant: "destructive",
      });
    }
  });

  const deleteAsset = useMutation({
    mutationFn: async (assetType: LegacyAssetType) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_legacy_assets')
        .delete()
        .eq('user_id', user.id)
        .eq('asset_type', assetType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-assets', user?.id] });
      toast({
        title: "Success", 
        description: "Legacy asset removed successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting legacy asset:', error);
      toast({
        title: "Error",
        description: "Failed to remove legacy asset",
        variant: "destructive",
      });
    }
  });

  // Helper function to get asset amount by type
  const getAssetAmount = (assetType: LegacyAssetType): number => {
    const asset = legacyAssets?.find(a => a.asset_type === assetType);
    return asset?.amount || 0;
  };

  // Helper function to get total asset count
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