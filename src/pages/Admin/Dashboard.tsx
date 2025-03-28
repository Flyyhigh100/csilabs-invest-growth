
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/Admin/Layout';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    totalUsers: 0,
    totalVolume: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get total transactions
      const { count: totalTransactions, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get pending transactions
      const { count: pendingTransactions, error: pendingError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // Get total volume
      const { data: volumeData, error: volumeError } = await supabase
        .from('transactions')
        .select('amount');
      
      if (volumeError) throw volumeError;
      
      const totalVolume = volumeData.reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      setStats({
        totalTransactions: totalTransactions || 0,
        pendingTransactions: pendingTransactions || 0,
        totalUsers: totalUsers || 0,
        totalVolume
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
          </div>
        ) : (
          <>
            {stats.pendingTransactions > 0 && (
              <Card className="border-yellow-300 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-800 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-800 mb-4">
                    You have {stats.pendingTransactions} pending transaction{stats.pendingTransactions !== 1 ? 's' : ''} that require your attention.
                  </p>
                  <Button asChild>
                    <Link to="/admin/transactions">
                      View Pending Transactions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalVolume.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime token sales
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered accounts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Transactions
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    All payment transactions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Transactions
                  </CardTitle>
                  <AlertTriangle className={`h-4 w-4 ${stats.pendingTransactions > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting token distribution
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Management</CardTitle>
                  <CardDescription>
                    Review and manage token purchase transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    View all transactions, mark pending transactions as completed after distributing tokens to customers, and export transaction reports.
                  </p>
                  <Button asChild>
                    <Link to="/admin/transactions">
                      Manage Transactions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Browse user profiles, view transaction history for individual users, and manage account settings.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/admin/users">
                      Manage Users
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
