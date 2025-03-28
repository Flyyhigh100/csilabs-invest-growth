
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, CreditCard, FileText, UserCheck } from 'lucide-react';

const DashboardHome = () => {
  // Mock data - would be fetched from API in a real app
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const kycStatus = 'pending'; // pending, approved, rejected
  const transactions = []; // Mock empty transactions list

  const getKycStatusUi = () => {
    switch (kycStatus) {
      case 'approved':
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
          title: 'KYC Verified',
          description: 'Your identity has been verified successfully.',
          actionButton: null,
          color: 'bg-green-50'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: 'KYC Rejected',
          description: 'Your identity verification was rejected. Please try again.',
          actionButton: (
            <Button className="w-full mt-4">
              Resubmit KYC
            </Button>
          ),
          color: 'bg-red-50'
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="h-8 w-8 text-amber-500" />,
          title: 'KYC Pending',
          description: 'Your identity verification is being processed.',
          actionButton: null,
          color: 'bg-amber-50'
        };
    }
  };

  const kycStatusUi = getKycStatusUi();

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* KYC Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">KYC Verification</CardTitle>
            <CardDescription>Identity verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center p-4 rounded-md ${kycStatusUi.color}`}>
              <div className="mr-4">{kycStatusUi.icon}</div>
              <div>
                <h3 className="font-medium">{kycStatusUi.title}</h3>
                <p className="text-sm text-gray-600">{kycStatusUi.description}</p>
              </div>
            </div>
            {kycStatus === 'pending' && (
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/dashboard/kyc">
                  <UserCheck className="mr-2 h-4 w-4" /> Complete Verification
                </Link>
              </Button>
            )}
            {kycStatusUi.actionButton}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/transactions">
                <CreditCard className="mr-2 h-4 w-4" /> View Transactions
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/documents">
                <FileText className="mr-2 h-4 w-4" /> View Documents
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/profile">
                <UserCheck className="mr-2 h-4 w-4" /> Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Account Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Account Overview</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{user.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium capitalize">{user.role || 'Standard'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <CardDescription>Your most recent payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
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
              <p className="text-sm text-gray-500 mt-1">When you make a payment, it will appear here.</p>
              <Button className="mt-4" asChild>
                <Link to="/dashboard/transactions">
                  View All Transactions
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DashboardHome;
