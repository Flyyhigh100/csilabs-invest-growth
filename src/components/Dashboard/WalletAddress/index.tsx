
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { WalletFormValues } from './types';
import { WalletInfoBox, WalletWarningBox } from './InfoBoxes';
import WalletAddressDisplay from './WalletAddressDisplay';
import WalletForm from './WalletAddressForm';

interface WalletAddressFormProps {
  existingWalletAddress?: string;
  onWalletUpdated?: () => void;
}

const WalletAddressForm: React.FC<WalletAddressFormProps> = ({ 
  existingWalletAddress, 
  onWalletUpdated 
}) => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(!existingWalletAddress);
  
  useEffect(() => {
    if (existingWalletAddress) {
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }, [existingWalletAddress]);

  const handleSubmit = async (data: WalletFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your wallet address");
      return;
    }

    try {
      // Update the wallet address in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: data.walletAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Wallet address saved successfully");
      setEditMode(false);
      
      if (onWalletUpdated) {
        onWalletUpdated();
      }
    } catch (error) {
      console.error("Error saving wallet address:", error);
      toast.error("Failed to save wallet address");
    }
  };

  return (
    <div className="w-full">
      <WalletInfoBox />
      
      {existingWalletAddress && !editMode ? (
        <WalletAddressDisplay 
          walletAddress={existingWalletAddress} 
          onEditClick={() => setEditMode(true)} 
        />
      ) : (
        <WalletForm 
          defaultWalletAddress={existingWalletAddress || ""}
          onSubmit={handleSubmit}
          onCancel={existingWalletAddress ? () => setEditMode(false) : undefined}
        />
      )}
      
      <WalletWarningBox />
    </div>
  );
};

export default WalletAddressForm;
