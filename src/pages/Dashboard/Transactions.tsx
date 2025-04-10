
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';
import { useKycVerification } from '@/hooks/useKycVerification';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionVerification } from '@/hooks/transactions/useTransactionVerification';
import { CanceledAlert, PendingVerificationAlert, SuccessAlert } from '@/components/Dashboard/Transactions/StatusAlerts';
import TransactionHeader from '@/components/Dashboard/Transactions/TransactionHeader';
import TransactionContent from '@/components/Dashboard/Transactions/TransactionContent';

const Transactions = () => {
  const { kycData } = useKycVerification();
  const [searchParams] = useSearchParams();
  const { user, refreshSession } = useAuth();
  
  const isKycApproved = kycData?.status === 'approved';
  
  // In test mode, we'll allow transactions without KYC
  const allowTransactionsWithoutKYC = true;
  
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');

  const {
    transaction,
    isRefreshing,
    hasCheckedStatus,
    handleRefresh
  } = useTransactionVerification({
    sessionId,
    success,
    userId: user?.id,
    refreshSession
  });

  return (
    <DashboardLayout title="Transactions">
      {/* Payment Status Alerts */}
      {success === 'true' && transaction && (
        <SuccessAlert 
          transaction={transaction} 
          isRefreshing={isRefreshing} 
          onRefresh={handleRefresh} 
        />
      )}
      
      {success === 'true' && !transaction && !isRefreshing && hasCheckedStatus && (
        <PendingVerificationAlert 
          isRefreshing={isRefreshing} 
          onRefresh={handleRefresh} 
        />
      )}
      
      {canceled === 'true' && <CanceledAlert />}
      
      {/* KYC Status Banner */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardHeader className="pb-2">
            <CardHeader className="text-lg">Verification Status</CardHeader>
            <CardContent>Your identity verification status</CardContent>
          </CardHeader>
        </CardHeader>
        <CardContent>
          <KycStatusBanner />
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-2">
          <TransactionHeader 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
          />
        </CardHeader>
        <CardContent>
          <TransactionContent 
            isKycApproved={isKycApproved} 
            allowTransactionsWithoutKYC={allowTransactionsWithoutKYC} 
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Transactions;
