
import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import the enhanced components
import EnhancedUsersTable from './EnhancedUsersTable';
import UsersToolbar from './UsersToolbar';
import UsersError from './UsersError';
import UsersLoading from './UsersLoading';

// Import the hook for admin users
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';

const AdminUsersPage: React.FC = () => {
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
          refetch();
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
          refetch();
        }
      )
      .subscribe();

    // Set up realtime subscription for transactions changes
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
          toast.info('Transaction updated');
          refetch();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(txChannel);
    };
  }, [refetch]);
  
  return (
    <AdminLayout title="Users">
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <UsersIcon className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            View and manage all users and their transaction data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <UsersToolbar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            onTestDbConnection={() => {}}
          />
          
          <div className="overflow-x-auto -mx-3 md:mx-0">
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
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsersPage;
