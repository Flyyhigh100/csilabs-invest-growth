
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, BarChart2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';

// Import the enhanced components
import EnhancedUsersTable from './EnhancedUsersTable';
import UsersToolbar from './UsersToolbar';
import UsersError from './UsersError';
import UsersLoading from './UsersLoading';
import UserStats from './Dashboard/UserStats';
import TestDataToggle from '@/components/Admin/TestDataToggle';

// Import the hook for admin users
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';

const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('table');
  const { includeTestData, setIncludeTestData } = useTestDataToggle(false);
  const queryClient = useQueryClient();
  
  const { 
    users, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery, 
    handleRefresh, 
    checkUserKyc,
    refetch 
  } = useAdminUsers();
  
  useEffect(() => {
    // Force refresh on component mount
    refetch();
    
    // Set up unified revalidation approach for all key UI data
    const invalidateAllUserRelatedQueries = () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      // Also invalidate transaction stats query used in EnhancedUsersTable
      queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
      // If there are any other user-related queries, invalidate them here
    };
    
    // Set up realtime subscription for profiles changes
    const profilesChannel = supabase
      .channel('admin-users-profiles-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile changed:', payload);
          toast.info('User profile updated');
          invalidateAllUserRelatedQueries();
        }
      )
      .subscribe();
    
    // Set up realtime subscription for KYC changes
    const kycChannel = supabase
      .channel('admin-users-kyc-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications'
        },
        (payload) => {
          console.log('KYC verification changed:', payload);
          toast.info('KYC verification updated');
          invalidateAllUserRelatedQueries();
        }
      )
      .subscribe();

    // Set up more comprehensive realtime subscription for transactions changes
    const txChannel = supabase
      .channel('admin-users-transactions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction changed:', payload);
          
          // More detailed logging for transaction status changes
          if (payload.eventType === 'UPDATE') {
            const oldData = payload.old as any;
            const newData = payload.new as any;
            
            if (oldData.status !== newData.status) {
              console.log(`Transaction status changed: ${oldData.status} -> ${newData.status}`);
              toast.info(`Transaction status updated: ${newData.status}`);
            }
          }
          
          // Invalidate transaction stats to ensure user table displays correct information
          invalidateAllUserRelatedQueries();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(txChannel);
    };
  }, [refetch, queryClient]);
  
  return (
    <AdminLayout title="Users">
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <UsersIcon className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                View and manage all users and their transaction data
              </CardDescription>
            </div>
            <TestDataToggle 
              checked={includeTestData}
              onCheckedChange={setIncludeTestData}
              showAlert={true} 
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-3 md:p-6">
          <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="table">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Users Table
                </TabsTrigger>
                <TabsTrigger value="dashboard">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  User Analytics
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="table" className="m-0">
              <UsersToolbar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={handleRefresh}
                onTestDbConnection={() => {}}
              />
              
              <div className="overflow-x-auto -mx-3 md:mx-0 mt-4">
                {isLoading ? (
                  <UsersLoading />
                ) : error ? (
                  <UsersError error={error as Error} onRetry={handleRefresh} />
                ) : (
                  <div className="min-w-full px-3 md:px-0">
                    <EnhancedUsersTable 
                      users={users} 
                      onCheckKyc={checkUserKyc} 
                      searchQuery={searchQuery}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard" className="m-0">
              {isLoading ? (
                <UsersLoading />
              ) : error ? (
                <UsersError error={error as Error} onRetry={handleRefresh} />
              ) : (
                <UserStats users={users} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsersPage;
