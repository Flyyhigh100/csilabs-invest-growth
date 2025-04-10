
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';
import { useKycVerification } from '@/hooks/useKycVerification';
import TransactionsList from '@/components/Dashboard/TransactionsList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Transactions = () => {
  const { kycData } = useKycVerification();
  const [searchParams] = useSearchParams();
  const { user, refreshSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  
  const isKycApproved = kycData?.status === 'approved';
  
  // In test mode, we'll allow transactions without KYC
  const allowTransactionsWithoutKYC = true;
  
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      toast.success("Transactions refreshed");
    } catch (err) {
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Check session and transaction status
  useEffect(() => {
    if (sessionId && !hasCheckedStatus && user?.id) {
      const checkTransaction = async () => {
        try {
          console.log(`Checking transaction status for session ${sessionId}...`);
          setIsRefreshing(true);
          
          // Check if the transaction exists and update UI accordingly
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', sessionId)
            .single();
          
          if (error) {
            console.error("Error checking transaction:", error);
            if (success === 'true') {
              toast.error("Could not find your transaction", {
                description: "Please refresh the page or contact support if the problem persists."
              });
            }
          } else if (data) {
            console.log("Transaction found:", data.status);
            
            if (data.status === 'completed') {
              // Transaction is completed, show success message
              if (success === 'true' && !hasCheckedStatus) {
                toast.success("Payment successful!", {
                  description: "Your tokens will be sent to your wallet shortly."
                });
              }
            } else if (data.status === 'pending' && success === 'true') {
              // Transaction is still pending but Stripe says success, wait and check again
              toast.info("Processing your payment...", {
                description: "This may take a moment, please wait."
              });
              
              // Check again after delay
              setTimeout(() => {
                checkTransaction();
                return;
              }, 3000);
            }
          } else {
            console.log("No transaction found for session ID:", sessionId);
            
            // If success is true but no transaction found, show a message
            if (success === 'true' && !hasCheckedStatus) {
              toast.info("Finalizing your payment...", {
                description: "Please wait while we confirm your payment."
              });
              
              // Check again after delay 
              setTimeout(() => {
                checkTransaction();
                return;
              }, 5000);
            }
          }
          
          setHasCheckedStatus(true);
          setIsRefreshing(false);
        } catch (err) {
          console.error("Error in transaction check:", err);
          setIsRefreshing(false);
        }
      };
      
      checkTransaction();
    }
  }, [sessionId, success, canceled, user?.id, hasCheckedStatus]);
  
  // Handle initial success/cancel messages from URL parameters
  useEffect(() => {
    if (success === 'true' && !sessionId) {
      toast.success("Payment successful!");
    } else if (canceled === 'true') {
      toast.error("Payment was canceled. No charges were made.");
    }
  }, [success, canceled, sessionId]);

  return (
    <DashboardLayout title="Transactions">
      {/* Payment Status Alerts */}
      {success === 'true' && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>
            Your payment was processed successfully. Your tokens will be sent to your wallet shortly.
          </AlertDescription>
        </Alert>
      )}
      
      {canceled === 'true' && (
        <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Payment Canceled</AlertTitle>
          <AlertDescription>
            Your payment was canceled. No charges were made to your card.
          </AlertDescription>
        </Alert>
      )}
      
      {/* KYC Status Banner */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Verification Status</CardTitle>
          <CardDescription>Your identity verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <KycStatusBanner />
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <CardDescription>Your payment and token purchase history</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard/payments">Make a Purchase</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isKycApproved && !allowTransactionsWithoutKYC ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You need to complete KYC verification before you can make transactions.
              </p>
              <Button asChild>
                <Link to="/dashboard/kyc">Complete Verification</Link>
              </Button>
            </div>
          ) : (
            <TransactionsList />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Transactions;
