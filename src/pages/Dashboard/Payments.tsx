
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, CheckCircle, XCircle } from 'lucide-react';
import { useKycVerification } from '@/hooks/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import WalletAddressForm from '@/components/Dashboard/WalletAddressForm';
import BuyTokensTab from '@/components/Dashboard/BuyTokensTab';
import SellTokensTab from '@/components/Dashboard/SellTokensTab';
import KycWarning from '@/components/Dashboard/KycWarning';

const Payments = () => {
  const { kycData } = useKycVerification();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [searchParams] = useSearchParams();
  
  const isKycPending = kycData?.status === 'pending';
  const isKycApproved = kycData?.status === 'approved';
  const isKycRejected = kycData?.status === 'rejected';
  // For testing purposes - we're allowing payments even without KYC approval
  const allowPaymentsWithoutKYC = true;
  
  useEffect(() => {
    // Check for payment status in URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success("Payment successful! Your tokens will be sent to your wallet shortly.");
    } else if (canceled === 'true') {
      toast.error("Payment was canceled. No charges were made.");
    }
  }, [searchParams]);
  
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
    } catch (error) {
      console.error('Error fetching wallet address:', error);
    }
  };
  
  return (
    <DashboardLayout title="Payments">
      {!isKycApproved && !allowPaymentsWithoutKYC ? (
        <KycWarning />
      ) : (
        <>
          {!isKycApproved && allowPaymentsWithoutKYC && (
            <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
              <Info className="h-5 w-5" />
              <AlertTitle>Test Mode Active</AlertTitle>
              <AlertDescription>
                Normally, KYC verification would be required before payments. This is currently in test mode allowing payments without verification.
                {!kycData?.status && " We recommend completing verification in the KYC section."}
                {isKycPending && " Your verification is currently being reviewed."}
                {isKycRejected && " Your verification was rejected. Please try again with valid documents."}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <WalletAddressForm 
              existingWalletAddress={walletAddress || undefined} 
              onWalletUpdated={handleWalletUpdated} 
            />
          </div>
          
          <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="buy">Buy Tokens</TabsTrigger>
              <TabsTrigger value="sell">Sell Tokens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-6">
              <BuyTokensTab walletAddress={walletAddress} />
            </TabsContent>
            
            <TabsContent value="sell" className="mt-6">
              <SellTokensTab walletAddress={walletAddress} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
};

export default Payments;
