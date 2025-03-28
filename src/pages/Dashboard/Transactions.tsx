
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CreditCard, DollarSign } from 'lucide-react';
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';
import { useKycVerification } from '@/hooks/useKycVerification';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Transactions = () => {
  const { kycData } = useKycVerification();
  const isKycApproved = kycData?.status === 'approved';
  
  // Mock empty transactions list for now
  const transactions: any[] = [];

  // In test mode, we'll allow transactions without KYC
  const allowTransactionsWithoutKYC = true;

  return (
    <DashboardLayout title="Transactions">
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
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>Your payment and token purchase history</CardDescription>
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
          ) : transactions.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Transaction rows would go here */}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No transactions yet</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">When you make a payment, it will appear here.</p>
              
              <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal">
                <Link to="/dashboard/payments" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Buy Tokens Now
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Transactions;
