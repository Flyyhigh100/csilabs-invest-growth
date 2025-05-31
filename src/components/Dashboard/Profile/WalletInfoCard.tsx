
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { WalletIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getNetworkInfo } from '../WalletAddress/networkValidation';
import type { NetworkType } from '../WalletAddress/networkValidation';

const WalletInfoCard: React.FC = () => {
  const { profileData } = useProfileData();
  const navigate = useNavigate();
  
  const polygonAddress = profileData?.wallet_address;
  const solanaAddress = profileData?.solana_wallet_address;
  const preferredNetwork = (profileData?.preferred_network as NetworkType) || 'polygon';
  const hasAnyAddress = polygonAddress || solanaAddress;
  
  const handleUpdateWallet = () => {
    navigate('/dashboard/payments');
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Wallet Information</CardTitle>
        <CardDescription>Your connected wallets for token transfers</CardDescription>
      </CardHeader>
      <CardContent>
        {hasAnyAddress ? (
          <div className="space-y-4">
            {polygonAddress && (
              <div className="space-y-2">
                <div className="flex items-center text-sm gap-2">
                  <WalletIcon className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Polygon Wallet:</span>
                  {preferredNetwork === 'polygon' && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                      Preferred
                    </Badge>
                  )}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden break-all text-xs font-mono">
                  {polygonAddress}
                </div>
              </div>
            )}
            
            {solanaAddress && (
              <div className="space-y-2">
                <div className="flex items-center text-sm gap-2">
                  <WalletIcon className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Solana Wallet:</span>
                  {preferredNetwork === 'solana' && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                      Preferred
                    </Badge>
                  )}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden break-all text-xs font-mono">
                  {solanaAddress}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpdateWallet}
              >
                Update Wallets
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-500">
                No wallet addresses set
              </span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              Add wallet addresses to receive your tokens on Polygon or Solana networks.
            </p>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpdateWallet}
                className="border-yellow-300 hover:border-yellow-400 hover:bg-yellow-100 dark:border-yellow-800 dark:hover:bg-yellow-900/40"
              >
                Add Wallet Addresses
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletInfoCard;
