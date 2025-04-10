
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWalletAddress = () => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setWalletAddress(data.wallet_address);
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    };
    
    fetchWalletAddress();
  }, [user]);

  const handleWalletUpdated = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setWalletAddress(data.wallet_address);
      toast.success("Wallet address updated successfully", {
        description: "Your tokens will be sent to this wallet address after purchase."
      });
    } catch (error) {
      console.error('Error fetching wallet address:', error);
    }
  };

  return {
    walletAddress,
    isLoadingWallet,
    handleWalletUpdated
  };
};
