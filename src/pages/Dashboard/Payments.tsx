
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, CheckCircle, XCircle, HelpCircle, Wallet, ArrowRight } from 'lucide-react';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import WalletAddressForm from '@/components/Dashboard/WalletAddressForm';
import BuyTokensTab from '@/components/Dashboard/BuyTokensTab';
import SellTokensTab from '@/components/Dashboard/SellTokensTab';
import KycWarning from '@/components/Dashboard/KycWarning';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Payments = () => {
  const { kycData } = useKycVerification();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [searchParams] = useSearchParams();
  const [showInfoCard, setShowInfoCard] = useState(true);
  
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
          {showInfoCard && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h3 className="text-lg font-medium text-cbis-blue mb-2">Welcome to CSi Token Purchases</h3>
                    <p className="text-sm text-blue-700">
                      Follow these steps to purchase CSi tokens:
                    </p>
                    <ol className="text-sm text-blue-600 mt-2 list-decimal pl-5 space-y-1">
                      <li>Add your Polygon wallet address below</li>
                      <li>Choose the amount you wish to invest</li>
                      <li>Select your preferred payment method</li>
                      <li>Complete the transaction</li>
                    </ol>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-blue-600 hover:text-blue-700 mt-3 md:mt-0"
                    onClick={() => setShowInfoCard(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isKycApproved && allowPaymentsWithoutKYC && (
            <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
              <Info className="h-5 w-5" />
              <AlertTitle>Test Mode Active</AlertTitle>
              <AlertDescription>
                Normally, KYC verification would be required before high-value crypto payments. This is currently in test mode allowing payments without verification.
                {!kycData?.status && " We recommend completing verification in the KYC section."}
                {isKycPending && " Your verification is currently being reviewed."}
                {isKycRejected && " Your verification was rejected. Please try again with valid documents."}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-cbis-blue/10 p-2 rounded-full">
                    <Wallet className="h-5 w-5 text-cbis-blue" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-800">Step 1: Set Up Your Wallet</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 p-0">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3">
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Why do I need a wallet?</p>
                          <p className="text-xs">Your wallet address is where your CSi tokens will be sent after purchase. Think of it like a digital bank account for your tokens.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="p-6">
                <WalletAddressForm 
                  existingWalletAddress={walletAddress || undefined} 
                  onWalletUpdated={handleWalletUpdated} 
                />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-cbis-blue/10 p-2 rounded-full">
                    <ArrowRight className="h-5 w-5 text-cbis-blue" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-800">Step 2: Purchase or Sell Tokens</h2>
                </div>
              </div>
              
              <div className="p-6">
                <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
                    <TabsTrigger 
                      value="buy" 
                      className="data-[state=active]:bg-cbis-blue data-[state=active]:text-white"
                    >
                      Buy Tokens
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sell" 
                      className="data-[state=active]:bg-cbis-blue data-[state=active]:text-white"
                    >
                      Sell Tokens
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buy" className="mt-0">
                    <BuyTokensTab walletAddress={walletAddress} />
                  </TabsContent>
                  
                  <TabsContent value="sell" className="mt-0">
                    <SellTokensTab walletAddress={walletAddress} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Payments;
