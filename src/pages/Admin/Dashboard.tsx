
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, XCircle, Clock, CreditCard, 
  ArrowRight, DollarSign, Users, ShieldCheck
} from 'lucide-react';

const fetchDashboardStats = async () => {
  // Fetch counts for KYC verifications by status
  const { data: kycData, error: kycError } = await supabase
    .from('kyc_verifications')
    .select('status')
    .throwOnError();
  
  if (kycError) throw kycError;
  
  // Process KYC counts manually since groupBy is not available
  const kycCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    not_started: 0
  };
  
  if (kycData) {
    kycData.forEach(item => {
      if (item.status in kycCounts) {
        kycCounts[item.status as keyof typeof kycCounts]++;
      }
    });
  }
  
  // Fetch counts for pending token transfers
  const { count: pendingTokensCount, error: pendingError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .eq('token_sent', false);
  
  if (pendingError) throw pendingError;
  
  // Fetch total transaction value
  const { data: transactionData, error: transactionError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('status', 'completed');
  
  if (transactionError) throw transactionError;
  
  // Calculate total transaction value
  const totalValue = transactionData
    ? transactionData.reduce((sum, tx) => sum + Number(tx.amount), 0)
    : 0;
  
  return {
    kycCounts,
    pendingTokensCount: pendingTokensCount || 0,
    totalTransactionValue: totalValue
  };
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
  
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {isLoading ? '...' : data?.kycCounts.pending}
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm mt-2"
              onClick={() => navigate('/admin/kyc')}
            >
              View pending reviews <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Token Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {isLoading ? '...' : data?.pendingTokensCount}
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm mt-2"
              onClick={() => navigate('/admin/transactions')}
            >
              Process transfers <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved KYCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {isLoading ? '...' : data?.kycCounts.approved}
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm mt-2"
              onClick={() => navigate('/admin/kyc')}
            >
              View all KYCs <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transaction Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `$${data?.totalTransactionValue.toFixed(2)}`}
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm mt-2"
              onClick={() => navigate('/admin/transactions')}
            >
              View transactions <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>KYC Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <span>Pending Reviews</span>
                </div>
                <span className="font-bold">{isLoading ? '...' : data?.kycCounts.pending}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Approved</span>
                </div>
                <span className="font-bold">{isLoading ? '...' : data?.kycCounts.approved}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span>Rejected</span>
                </div>
                <span className="font-bold">{isLoading ? '...' : data?.kycCounts.rejected}</span>
              </div>
              
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-cbis-blue to-cbis-teal"
                onClick={() => navigate('/admin/kyc')}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Manage KYC Verifications
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                <h3 className="font-medium flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pending Token Transfers
                </h3>
                <p className="mt-2 text-sm">
                  There are <strong>{isLoading ? '...' : data?.pendingTokensCount}</strong> users waiting to receive tokens after their payment was processed.
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Total Value:</span>
                    <p className="font-bold">${isLoading ? '...' : data?.totalTransactionValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-cbis-blue to-cbis-teal"
                onClick={() => navigate('/admin/transactions')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Manage Token Distribution
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
