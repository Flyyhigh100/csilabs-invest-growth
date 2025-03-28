
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DollarSign, UserCheck, FileText, CreditCard } from 'lucide-react';
import { useKycVerification } from '@/hooks/useKycVerification';

const ActionCard = ({ 
  title, 
  description, 
  link, 
  icon, 
  buttonText 
}: { 
  title: string; 
  description: string; 
  link: string; 
  icon: React.ReactNode; 
  buttonText: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button asChild className="w-full">
        <Link to={link} className="flex items-center justify-center gap-2">
          {icon}
          {buttonText}
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  const { kycData } = useKycVerification();
  
  const isKycCompleted = kycData?.status === 'approved';
  const isKycPending = kycData?.status === 'pending';
  const isKycRejected = kycData?.status === 'rejected';
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="Buy Tokens"
          description="Purchase CSi tokens using credit card or cryptocurrency"
          link="/dashboard/payments"
          icon={<DollarSign className="h-4 w-4" />}
          buttonText="Buy Tokens"
        />
        
        <ActionCard
          title="KYC Verification"
          description={
            isKycCompleted ? "Your identity has been verified" :
            isKycPending ? "Your verification is in progress" :
            isKycRejected ? "Your verification was rejected" :
            "Complete your identity verification"
          }
          link="/dashboard/kyc"
          icon={<UserCheck className="h-4 w-4" />}
          buttonText={
            isKycCompleted ? "View Status" :
            isKycPending ? "Check Status" :
            isKycRejected ? "Try Again" :
            "Verify Identity"
          }
        />
        
        <ActionCard
          title="Transactions"
          description="View your transaction history and status"
          link="/dashboard/transactions"
          icon={<CreditCard className="h-4 w-4" />}
          buttonText="View Transactions"
        />
        
        <ActionCard
          title="Documents"
          description="Access your important documents and certificates"
          link="/dashboard/documents"
          icon={<FileText className="h-4 w-4" />}
          buttonText="View Documents"
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
