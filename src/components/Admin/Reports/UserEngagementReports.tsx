
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, AlertTriangle, CheckCircle, Clock, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const UserEngagementReports: React.FC = () => {
  const { data: engagementData, isLoading } = useQuery({
    queryKey: ['user-engagement-reports'],
    queryFn: async () => {
      const [usersResult, kycResult, transactionsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*'),
        supabase
          .from('kyc_verifications')
          .select('*')
          .eq('is_test', false),
        supabase
          .from('transactions')
          .select('user_id, status, created_at')
          .eq('is_test', false)
      ]);

      const users = usersResult.data || [];
      const kycVerifications = kycResult.data || [];
      const transactions = transactionsResult.data || [];

      // Users without wallet addresses (need follow-up)
      const usersWithoutWallets = users.filter(u => 
        !u.wallet_address && !u.solana_wallet_address
      );

      // Users with failed KYC (need support)
      const failedKycUsers = kycVerifications
        .filter(k => k.status === 'rejected')
        .map(k => {
          const user = users.find(u => u.id === k.user_id);
          return { ...k, user };
        })
        .filter(k => k.user);

      // Users with pending KYC (need follow-up)
      const pendingKycUsers = kycVerifications
        .filter(k => k.status === 'pending')
        .map(k => {
          const user = users.find(u => u.id === k.user_id);
          return { ...k, user };
        })
        .filter(k => k.user);

      // Users with transactions but no recent activity (re-engagement)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const inactiveUsers = users.filter(u => {
        const hasTransactions = transactions.some(t => t.user_id === u.id);
        const hasRecentActivity = transactions.some(t => 
          t.user_id === u.id && new Date(t.created_at) > thirtyDaysAgo
        );
        return hasTransactions && !hasRecentActivity;
      });

      // Authentication method breakdown
      const authMethods = users.reduce((acc, u) => {
        // This is a simplified approach - in real implementation you'd check auth.users
        const hasPassword = true; // Placeholder
        const method = hasPassword ? 'Email/Password' : 'Magic Link';
        if (!acc[method]) acc[method] = 0;
        acc[method]++;
        return acc;
      }, {} as Record<string, number>);

      // KYC completion rates
      const kycStats = {
        total: users.length,
        notStarted: users.length - kycVerifications.length,
        pending: kycVerifications.filter(k => k.status === 'pending').length,
        approved: kycVerifications.filter(k => k.status === 'approved').length,
        rejected: kycVerifications.filter(k => k.status === 'rejected').length
      };

      return {
        usersWithoutWallets,
        failedKycUsers,
        pendingKycUsers,
        inactiveUsers,
        authMethods: Object.entries(authMethods).map(([method, count]) => ({ method, count })),
        kycStats,
        totalUsers: users.length
      };
    }
  });

  const exportUserFollowUpList = async (type: string) => {
    try {
      let users: any[] = [];
      let filename = '';

      switch (type) {
        case 'no-wallet':
          users = engagementData?.usersWithoutWallets || [];
          filename = 'users-need-wallet-setup';
          break;
        case 'failed-kyc':
          users = engagementData?.failedKycUsers?.map(k => k.user) || [];
          filename = 'users-failed-kyc';
          break;
        case 'pending-kyc':
          users = engagementData?.pendingKycUsers?.map(k => k.user) || [];
          filename = 'users-pending-kyc';
          break;
        case 'inactive':
          users = engagementData?.inactiveUsers || [];
          filename = 'inactive-users-reengagement';
          break;
        default:
          return;
      }

      if (users.length === 0) {
        toast.error('No users found for this category');
        return;
      }

      // Create CSV content
      const headers = [
        'First Name',
        'Last Name',
        'Email',
        'Registration Date',
        'Wallet Address',
        'Solana Wallet',
        'Preferred Network',
        'Follow-up Reason'
      ];

      const reason = type === 'no-wallet' ? 'Missing wallet address' :
                   type === 'failed-kyc' ? 'KYC verification failed' :
                   type === 'pending-kyc' ? 'KYC verification pending' :
                   'Inactive user - re-engagement needed';

      const csvRows = users.map(user => [
        user.first_name || '',
        user.last_name || '',
        user.email || '',
        new Date(user.created_at).toLocaleDateString(),
        user.wallet_address || 'Not set',
        user.solana_wallet_address || 'Not set',
        user.preferred_network || 'Not set',
        reason
      ]);

      const csvContent = [headers, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${users.length} users exported for follow-up`);
    } catch (error) {
      console.error('Error exporting user list:', error);
      toast.error('Failed to export user list');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Without Wallets */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-yellow-600" />
              Need Wallet Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {engagementData?.usersWithoutWallets?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Users without wallet addresses
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => exportUserFollowUpList('no-wallet')}
              className="w-full"
            >
              <Download className="h-3 w-3 mr-1" />
              Export List
            </Button>
          </CardContent>
        </Card>

        {/* Pending KYC */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Pending KYC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {engagementData?.pendingKycUsers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Users awaiting KYC review
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => exportUserFollowUpList('pending-kyc')}
              className="w-full"
            >
              <Download className="h-3 w-3 mr-1" />
              Export List
            </Button>
          </CardContent>
        </Card>

        {/* Failed KYC */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Failed KYC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {engagementData?.failedKycUsers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Users need KYC assistance
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => exportUserFollowUpList('failed-kyc')}
              className="w-full"
            >
              <Download className="h-3 w-3 mr-1" />
              Export List
            </Button>
          </CardContent>
        </Card>

        {/* Inactive Users */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {engagementData?.inactiveUsers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Need re-engagement
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => exportUserFollowUpList('inactive')}
              className="w-full"
            >
              <Download className="h-3 w-3 mr-1" />
              Export List
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* KYC Completion Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Completion Progress</CardTitle>
          <CardDescription>Track user verification status and completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{engagementData?.kycStats?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{engagementData?.kycStats?.notStarted || 0}</div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{engagementData?.kycStats?.pending || 0}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{engagementData?.kycStats?.approved || 0}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{engagementData?.kycStats?.rejected || 0}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">Completion Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${((engagementData?.kycStats?.approved || 0) / (engagementData?.kycStats?.total || 1)) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {(((engagementData?.kycStats?.approved || 0) / (engagementData?.kycStats?.total || 1)) * 100).toFixed(1)}% approved
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEngagementReports;
