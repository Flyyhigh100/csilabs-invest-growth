
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

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
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  
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
      
      toast.success("Wallet address saved and confirmed successfully");
      setEditMode(false);
      setShowSuccessBanner(true);
      
      // Hide success banner after 5 seconds
      setTimeout(() => {
        setShowSuccessBanner(false);
      }, 5000);
      
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
      
      {showSuccessBanner && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p className="text-green-800 font-medium">Wallet address confirmed successfully</p>
            <p className="text-green-700 text-sm">Your wallet address has been verified and saved.</p>
          </div>
        </div>
      )}
      
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
