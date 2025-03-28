
import React, { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CreditCard, Bitcoin, ChevronRight, Info, Check } from 'lucide-react';
import { useKycVerification } from '@/hooks/useKycVerification';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const PaymentOption = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  disabled = false,
  recommended = false
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean;
  recommended?: boolean;
}) => (
  <Card className={`cursor-pointer border-2 transition-all ${disabled ? 'opacity-60' : 'hover:border-cbis-blue'} ${recommended ? 'border-cbis-teal' : 'border-transparent'}`}>
    <CardContent className="p-6" onClick={disabled ? undefined : onClick}>
      <div className="flex items-start space-x-4">
        <div className="bg-blue-50 p-3 rounded-full">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">{title}</h3>
            {recommended && (
              <span className="bg-cbis-teal/10 text-cbis-teal text-xs px-2 py-1 rounded-full flex items-center">
                <Check className="h-3 w-3 mr-1" /> Recommended
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </CardContent>
  </Card>
);

const Payments = () => {
  const { kycData } = useKycVerification();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  
  const isKycPending = kycData?.status === 'pending';
  const isKycApproved = kycData?.status === 'approved';
  const isKycRejected = kycData?.status === 'rejected';
  // For testing purposes - we're allowing payments even without KYC approval
  const allowPaymentsWithoutKYC = true;
  
  const handleStripePayment = () => {
    // Implement Stripe checkout here
    toast.info("Redirecting to Stripe checkout...");
    // In a real implementation, you would redirect to your Stripe checkout page or modal
    setTimeout(() => {
      toast.success("This is a demo. In production, users would be redirected to Stripe.");
    }, 1500);
  };
  
  const handleCryptoPayment = () => {
    // Implement CoinPayments checkout here
    toast.info("Preparing crypto payment options...");
    // In a real implementation, you would redirect to your CoinPayments checkout or show payment addresses
    setTimeout(() => {
      toast.success("This is a demo. In production, users would see crypto payment options.");
    }, 1500);
  };
  
  return (
    <DashboardLayout title="Payments">
      {!isKycApproved && !allowPaymentsWithoutKYC ? (
        <Card>
          <CardHeader>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>You need to complete KYC verification before making payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Identity Verification Required</AlertTitle>
              <AlertDescription>
                To comply with financial regulations, we need to verify your identity before you can make any payments or purchase tokens.
              </AlertDescription>
            </Alert>
            <Button asChild>
              <Link to="/dashboard/kyc">Complete Verification</Link>
            </Button>
          </CardContent>
        </Card>
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
          
          <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="buy">Buy Tokens</TabsTrigger>
              <TabsTrigger value="sell">Sell Tokens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase CSi Tokens</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PaymentOption 
                    title="Credit/Debit Card" 
                    description="Pay securely with Stripe using any major credit or debit card"
                    icon={<CreditCard className="h-6 w-6 text-cbis-blue" />}
                    onClick={handleStripePayment}
                    recommended={true}
                  />
                  
                  <PaymentOption 
                    title="Cryptocurrency" 
                    description="Pay with Bitcoin, Ethereum, or other popular cryptocurrencies"
                    icon={<Bitcoin className="h-6 w-6 text-cbis-blue" />}
                    onClick={handleCryptoPayment}
                  />
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <p className="text-sm text-gray-500">
                    By proceeding with payment, you agree to our terms and conditions. All transactions are secure and encrypted.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="sell" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sell CSi Tokens</CardTitle>
                  <CardDescription>Coming soon</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <Info className="h-5 w-5" />
                    <AlertTitle>Feature in Development</AlertTitle>
                    <AlertDescription>
                      Token selling functionality will be available after the initial offering period. Please check back later.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
};

export default Payments;
