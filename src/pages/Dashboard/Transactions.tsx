
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionVerification } from '@/hooks/transactions/useTransactionVerification';
import { CanceledAlert, PendingVerificationAlert, SuccessAlert } from '@/components/Dashboard/Transactions/StatusAlerts';
import TransactionHeader from '@/components/Dashboard/Transactions/TransactionHeader';
import TransactionContent from '@/components/Dashboard/Transactions/TransactionContent';
import { TooltipProvider } from '@/components/ui/tooltip';

const Transactions = () => {
  const [searchParams] = useSearchParams();
  const { user, refreshSession } = useAuth();
  
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
    <TooltipProvider>
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
              isKycApproved={true}
              allowTransactionsWithoutKYC={allowTransactionsWithoutKYC} 
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    </TooltipProvider>
  );
};

export default Transactions;
