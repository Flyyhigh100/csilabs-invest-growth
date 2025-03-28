
import React from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CreditCard, FileText, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import KycStatusBanner from '@/components/Dashboard/KycStatusBanner';

const DashboardHome = () => {
  const { user } = useAuth();

  // Mock empty transactions list for now
  const transactions: any[] = [];

  // Fetch user profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

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
            <KycStatusBanner />
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
                <p className="font-medium">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                {isLoadingProfile ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin mr-2" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="font-medium">
                    {profileData?.first_name || ''} {profileData?.last_name || ''}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString() 
                    : 'Today'}
                </p>
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
