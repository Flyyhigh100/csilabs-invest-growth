
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TokenPriceHeaderWithProvider from '@/components/Dashboard/TokenPriceHeaderWithProvider';
import PaymentInfoCard from '@/components/Dashboard/PaymentInfoCard';
import { KycVerificationData } from '@/hooks/kyc/types';
import { Coins, LineChart, Shield, Zap } from 'lucide-react';

interface PaymentSidePanelProps {
  kycData: KycVerificationData | null;
  showInfoCard: boolean;
  setShowInfoCard: (show: boolean) => void;
}

const PaymentSidePanel: React.FC<PaymentSidePanelProps> = ({
  kycData,
  showInfoCard,
  setShowInfoCard
}) => {
  return (
    <>
      {/* Token Price Card */}
      <Card className="overflow-hidden border-cbis-blue/10 shadow-md">
        <div className="h-2 bg-gradient-to-r from-cbis-blue to-cbis-teal"></div>
        <CardContent className="p-4">
          <TokenPriceHeaderWithProvider className="w-full" />
        </CardContent>
      </Card>
      
      {/* Purchase Info Card */}
      <PaymentInfoCard 
        showInfoCard={showInfoCard} 
        setShowInfoCard={setShowInfoCard} 
      />
      
      {/* Token Benefits */}
      <Card className="border-cbis-blue/10 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">CSi Token Benefits</h3>
          
          <div className="space-y-3">
            <BenefitItem 
              icon={<Shield className="h-4 w-4" />}
              title="Research Backed"
              description="Support groundbreaking research and development"
            />
            
            <BenefitItem 
              icon={<Coins className="h-4 w-4" />}
              title="Token Utility"
              description="Access to Cancer Killing Community and future services"
            />
            
            <BenefitItem 
              icon={<Zap className="h-4 w-4" />}
              title="Fast Transactions"
              description="Built on Polygon for speed and low gas fees"
            />
            
            <BenefitItem 
              icon={<LineChart className="h-4 w-4" />}
              title="Growth Potential"
              description="Early access to an expanding ecosystem"
            />
          </div>
          
          {/* KYC Status */}
          {kycData && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700">KYC Verification Status</h4>
              <div className={`text-sm mt-1 ${
                kycData.status === 'approved' 
                  ? 'text-green-600' 
                  : kycData.status === 'pending' 
                  ? 'text-amber-600'
                  : 'text-gray-500'
              }`}>
                {kycData.status === 'approved' 
                  ? '✓ Verified' 
                  : kycData.status === 'pending'
                  ? '⟳ Pending Review'
                  : 'Not Verified'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// Helper component for benefit items
const BenefitItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="bg-cbis-blue/10 p-2 rounded-full flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-800">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

export default PaymentSidePanel;
