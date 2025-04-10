
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
import { CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Transactions = () => {
  const { kycData } = useKycVerification();
  const [searchParams] = useSearchParams();
  const { user, refreshSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [transaction, setTransaction] = useState<any>(null);
  
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
  
  // Check for Stripe session data in localStorage and handle transaction recovery
  useEffect(() => {
    const stripeData = localStorage.getItem('stripe_session_data');
    if (stripeData) {
      try {
        const data = JSON.parse(stripeData);
        console.log("Found Stripe session data in localStorage:", {
          session_id: data.session_id,
          payment_intent: data.payment_intent,
          timestamp: new Date(data.timestamp).toISOString(),
          amount: data.amount,
          wallet_address: data.wallet_address
        });
        
        // If we returned from Stripe with success but no transaction found,
        // we could use this data to recover and verify the transaction
        if (success === 'true' && !sessionId && data.session_id) {
          console.log("Success param without session_id, using stored session:", data.session_id);
          // Use stored session ID to check transaction
          const checkStoredTransaction = async () => {
            try {
              const { data: txData, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('transaction_id', data.session_id)
                .maybeSingle();
                
              if (error) {
                console.error("Error checking stored transaction:", error);
              } else if (txData) {
                console.log("Found transaction using stored session ID:", txData);
                setTransaction(txData);
                setHasCheckedStatus(true);
                
                // Clean up localStorage if we found the transaction
                localStorage.removeItem('stripe_session_data');
                return;
              }
              
              // If we get here, we didn't find a transaction for the stored session ID
              // This might be a case where the webhook hasn't processed yet
              // Set up polling to check again
              if (!hasCheckedStatus) {
                setTimeout(() => {
                  setPollingCount(prev => prev + 1);
                }, 2000);
              }
            } catch (err) {
              console.error("Error in stored transaction check:", err);
            }
          };
          
          checkStoredTransaction();
        }
      } catch (e) {
        console.error("Error parsing Stripe session data:", e);
      }
    }
  }, [success, sessionId, pollingCount]);
  
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
            .maybeSingle();
          
          if (error) {
            console.error("Error checking transaction:", error);
            if (success === 'true' && pollingCount === 0) {
              toast.info("Checking payment status...", {
                description: "Please wait while we verify your payment."
              });
            }
          } else if (data) {
            setTransaction(data);
            console.log("Transaction found:", data.status, data);
            
            if (data.status === 'completed') {
              // Transaction is completed, show success message
              if (success === 'true') {
                toast.success("Payment successful!", {
                  description: "Your tokens will be sent to your wallet shortly."
                });
              }
              setHasCheckedStatus(true);
              
              // Clean up localStorage if we found the transaction
              localStorage.removeItem('stripe_session_data');
            } else if (data.status === 'pending' && success === 'true') {
              // Transaction is still pending but Stripe says success, wait and check again
              if (pollingCount === 0) {
                toast.info("Verifying your payment...", {
                  description: "This may take a moment, please wait."
                });
              }
              
              // Poll with exponential backoff
              if (pollingCount < 5) {
                const delay = Math.min(2000 * Math.pow(1.5, pollingCount), 10000);
                console.log(`Payment still pending. Will check again in ${delay}ms (attempt ${pollingCount + 1})`);
                
                setTimeout(() => {
                  setPollingCount(prev => prev + 1);
                  checkTransaction();
                }, delay);
                return;
              } else {
                // After several polling attempts, suggest manual refresh
                toast.info("Payment processing may take longer than expected", {
                  description: "You can manually refresh to check status updates.",
                  action: {
                    label: "Refresh",
                    onClick: handleRefresh
                  }
                });
                setHasCheckedStatus(true);
              }
            }
          } else {
            console.log("No transaction found for session ID:", sessionId);
            
            // If success is true but no transaction found, show a message
            if (success === 'true' && pollingCount === 0) {
              toast.info("Checking payment status...", {
                description: "Please wait while we verify your payment."
              });
              
              // Poll with exponential backoff
              if (pollingCount < 5) {
                const delay = Math.min(2000 * Math.pow(1.5, pollingCount), 10000);
                setTimeout(() => {
                  setPollingCount(prev => prev + 1);
                  checkTransaction();
                }, delay);
                return;
              }
            }
          }
          
          if (pollingCount >= 5) {
            setHasCheckedStatus(true);
          }
          setIsRefreshing(false);
        } catch (err) {
          console.error("Error in transaction check:", err);
          setIsRefreshing(false);
        }
      };
      
      checkTransaction();
    }
  }, [sessionId, success, canceled, user?.id, hasCheckedStatus, pollingCount]);
  
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
      {success === 'true' && transaction && (
        <Alert className={`mb-6 ${
          transaction.status === 'completed' 
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {transaction.status === 'completed' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
          <AlertTitle>
            {transaction.status === 'completed' 
              ? 'Payment Successful' 
              : 'Payment Processing'}
          </AlertTitle>
          <AlertDescription>
            {transaction.status === 'completed'
              ? 'Your payment was processed successfully. Your tokens will be sent to your wallet shortly.'
              : 'Your payment is being processed. This may take a few moments to complete.'}
            {transaction.status !== 'completed' && (
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Check Status
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {success === 'true' && !transaction && !isRefreshing && hasCheckedStatus && (
        <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
          <Clock className="h-5 w-5" />
          <AlertTitle>Payment Being Verified</AlertTitle>
          <AlertDescription>
            We're still verifying your payment. This process may take a few moments to complete.
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Check Status
              </Button>
            </div>
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
