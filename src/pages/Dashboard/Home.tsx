
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, FileCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Buy Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">Purchase CSI tokens with credit card or cryptocurrency.</CardDescription>
            <Button asChild className="w-full" variant="default">
              <Link to="/dashboard/payments">Buy Now</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              KYC Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">Complete your identity verification to unlock all features.</CardDescription>
            <Button asChild className="w-full" variant="outline">
              <Link to="/dashboard/kyc">Verify Identity</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">View your transaction history and token transfers.</CardDescription>
            <Button asChild className="w-full" variant="outline">
              <Link to="/dashboard/transactions">View History</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">Access your documents and legal agreements.</CardDescription>
            <Button asChild className="w-full" variant="outline">
              <Link to="/dashboard/documents">View Documents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle>Welcome to your dashboard</CardTitle>
            <CardDescription>Manage your account and transactions here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              This is your central hub for all CSi Labs token-related activities. From here you can purchase tokens,
              complete your KYC verification, view your transaction history, and manage your account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
