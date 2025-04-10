
import React, { useEffect } from 'react';
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
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Transactions = () => {
  const { kycData } = useKycVerification();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isKycApproved = kycData?.status === 'approved';
  
  // In test mode, we'll allow transactions without KYC
  const allowTransactionsWithoutKYC = true;
  
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const token = searchParams.get('token');
  
  // Handle auth token from redirect
  useEffect(() => {
    const handleAuthTokenFromUrl = async () => {
      if (token && !user) {
        console.log("Attempting to restore session from token in URL");
        try {
          // Attempt to set the session with the token from URL
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Failed to restore session:", error);
            toast.error("Your session expired. Please sign in again.");
          } else if (data.session) {
            console.log("Session restored successfully");
          }
        } catch (error) {
          console.error("Error restoring session:", error);
        }
      }
    };

    handleAuthTokenFromUrl();
  }, [token, user]);
  
  useEffect(() => {
    if (success === 'true') {
      toast.success("Payment successful! Your tokens will be sent to your wallet shortly.");
    } else if (canceled === 'true') {
      toast.error("Payment was canceled. No charges were made.");
    }
  }, [success, canceled]);

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
            <Button asChild variant="outline">
              <Link to="/dashboard/payments">Make a Purchase</Link>
            </Button>
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
