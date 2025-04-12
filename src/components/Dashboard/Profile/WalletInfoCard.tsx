
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { WalletIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WalletInfoCard: React.FC = () => {
  const { profileData } = useProfileData();
  const navigate = useNavigate();
  
  const walletAddress = profileData?.wallet_address;
  
  const handleUpdateWallet = () => {
    navigate('/dashboard/payments');
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Wallet Information</CardTitle>
        <CardDescription>Your connected wallet for token transfers</CardDescription>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <WalletIcon className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium mr-2">Wallet Address:</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden break-all text-sm">
              {walletAddress}
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpdateWallet}
              >
                Update Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-500">
                No wallet address set
              </span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              Add a wallet address to receive your tokens.
            </p>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpdateWallet}
                className="border-yellow-300 hover:border-yellow-400 hover:bg-yellow-100 dark:border-yellow-800 dark:hover:bg-yellow-900/40"
              >
                Add Wallet Address
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletInfoCard;
