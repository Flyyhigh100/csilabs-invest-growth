
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

import { WalletFormValues, NetworkType } from './networkValidation';
import { WalletInfoBox, WalletWarningBox } from './InfoBoxes';
import WalletAddressDisplay from './WalletAddressDisplay';
import WalletForm from './WalletAddressForm';

interface WalletAddressFormProps {
  existingWalletAddress?: string;
  existingSolanaWalletAddress?: string;
  existingPreferredNetwork?: NetworkType;
  onWalletUpdated?: () => void;
}

const WalletAddressForm: React.FC<WalletAddressFormProps> = ({ 
  existingWalletAddress, 
  existingSolanaWalletAddress,
  existingPreferredNetwork = 'polygon',
  onWalletUpdated 
}) => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState<NetworkType | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  
  const hasAnyAddress = existingWalletAddress || existingSolanaWalletAddress;
  
  useEffect(() => {
    if (!hasAnyAddress) {
      setEditMode('polygon'); // Default to polygon for new users
    } else {
      setEditMode(null);
    }
  }, [hasAnyAddress]);

  const handleSubmit = async (data: WalletFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your wallet address");
      return;
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        preferred_network: data.network
      };

      // Update the appropriate wallet address field
      if (data.network === 'polygon') {
        updateData.wallet_address = data.walletAddress;
      } else if (data.network === 'solana') {
        updateData.solana_wallet_address = data.walletAddress;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success(`${data.network === 'polygon' ? 'Polygon' : 'Solana'} wallet address saved and confirmed successfully`);
      setEditMode(null);
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

  const handleEditClick = (network: NetworkType) => {
    setEditMode(network);
  };

  const handleCancel = () => {
    setEditMode(null);
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
      
      {editMode ? (
        <WalletForm 
          defaultWalletAddress={existingWalletAddress || ""}
          defaultSolanaWalletAddress={existingSolanaWalletAddress || ""}
          defaultNetwork={editMode}
          onSubmit={handleSubmit}
          onCancel={hasAnyAddress ? handleCancel : undefined}
        />
      ) : (
        <WalletAddressDisplay 
          polygonAddress={existingWalletAddress}
          solanaAddress={existingSolanaWalletAddress}
          preferredNetwork={existingPreferredNetwork}
          onEditClick={handleEditClick}
        />
      )}
      
      <WalletWarningBox />
    </div>
  );
};

export default WalletAddressForm;
