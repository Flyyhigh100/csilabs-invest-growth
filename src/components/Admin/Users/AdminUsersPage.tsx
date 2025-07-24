
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users as UsersIcon, BarChart2, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';

// Import the enhanced components
import EnhancedUsersTable from './EnhancedUsersTable';
import EnhancedClientMasterTable from './EnhancedClientMasterTable';
import EnhancedClientDetailView from './EnhancedClientDetailView';
import UsersToolbar from './UsersToolbar';
import UsersError from './UsersError';
import UsersLoading from './UsersLoading';
import UserStats from './Dashboard/UserStats';
import TestDataToggle from '@/components/Admin/TestDataToggle';

// Import the hook for admin users
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';

// Import CSV export utility
import { downloadUsersCsv } from '@/utils/admin/csvExport';
import type { EnhancedClientData } from '@/hooks/admin/useEnhancedClientData';

const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('enhanced');
  const [selectedClient, setSelectedClient] = useState<EnhancedClientData | null>(null);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const { includeTestData, setIncludeTestData } = useTestDataToggle(false);
  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  
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
  
  // Force a refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);
  
  useEffect(() => {
    // Force refresh on component mount
    refetch();
    
    // Set up unified revalidation approach for all key UI data
    const invalidateAllUserRelatedQueries = () => {
      console.log('Invalidating all user-related queries...');
      
      // Invalidate user-related queries with different cache keys to ensure we catch all
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
      
      // Force a refresh of the users list
      refetch();
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
      .subscribe((status) => {
        console.log(`Profiles subscription status: ${status}`);
      });
    
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
      .subscribe((status) => {
        console.log(`KYC subscription status: ${status}`);
      });

    // Set up a dedicated channel for transaction status changes
    const txChannel = supabase
      .channel('admin-users-transactions-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: "status=eq.completed OR status=eq.pending OR status=eq.failed"
        },
        (payload) => {
          // Extract the old and new data
          const oldData = payload.old as any;
          const newData = payload.new as any;
          
          console.log('Transaction status changed:', {
            from: oldData.status,
            to: newData.status,
            user_id: newData.user_id,
            transaction_id: newData.id
          });
          
          // Check if the status has changed
          if (oldData.status !== newData.status) {
            console.log(`Transaction status changed from ${oldData.status} to ${newData.status}`);
            toast.info(`Transaction status updated from ${oldData.status} to ${newData.status}`);
            
            // More aggressive invalidation for status changes
            queryClient.invalidateQueries();
            
            // Force a refresh of the users list
            refetch();
            
            // Trigger the refresh counter
            setRefreshTrigger(prev => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Transaction status subscription status: ${status}`);
      });
    
    // Also set up a general transaction changes channel for other changes
    const generalTxChannel = supabase
      .channel('admin-users-all-transactions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction changed:', payload.eventType);
          invalidateAllUserRelatedQueries();
        }
      )
      .subscribe((status) => {
        console.log(`General transaction subscription status: ${status}`);
      });
    
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(txChannel);
      supabase.removeChannel(generalTxChannel);
    };
  }, [refetch, queryClient]);
  
  // Manual refresh function that invalidates all caches and forces a refetch
  const handleForceRefresh = () => {
    console.log('Forcing refresh of all data...');
    
    // Clear all queries in the cache
    queryClient.invalidateQueries();
    
    // Increment refresh trigger
    setRefreshTrigger(prev => prev + 1);
    
    // Force refetch
    refetch();
    
    toast.success('Forcing refresh of all data...');
  };
  
  // Handle CSV download
  const handleDownloadCsv = () => {
    try {
      setIsDownloadingCsv(true);
      
      if (!users || users.length === 0) {
        toast.error('No users found to export');
        return;
      }
      
      // Download the CSV file
      downloadUsersCsv(users, includeTestData);
      
      toast.success(`Successfully exported ${users.length} users to CSV`);
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.error('Failed to generate CSV file');
    } finally {
      setIsDownloadingCsv(false);
    }
  };

  // Handle viewing client details
  const handleViewClientDetails = (client: EnhancedClientData) => {
    setSelectedClient(client);
    setIsClientDetailOpen(true);
  };
  
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
          <Tabs defaultValue="enhanced" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="enhanced">
                  <Database className="h-4 w-4 mr-2" />
                  Client Master List
                </TabsTrigger>
                <TabsTrigger value="table">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Legacy Users Table
                </TabsTrigger>
                <TabsTrigger value="dashboard">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  User Analytics
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="enhanced" className="m-0">
              <div className="mt-4">
                <EnhancedClientMasterTable
                  onViewDetails={handleViewClientDetails}
                  searchQuery={searchQuery}
                />
              </div>
            </TabsContent>

            <TabsContent value="table" className="m-0">
              <UsersToolbar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={handleForceRefresh}
                onTestDbConnection={() => {}}
                onDownloadCsv={handleDownloadCsv}
                isDownloading={isDownloadingCsv}
              />
              
              <div className="overflow-x-auto -mx-3 md:mx-0 mt-4">
                {isLoading ? (
                  <UsersLoading />
                ) : error ? (
                  <UsersError error={error as Error} onRetry={handleForceRefresh} />
                ) : (
                  <div className="min-w-full px-3 md:px-0">
                    <EnhancedUsersTable 
                      users={users} 
                      onCheckKyc={checkUserKyc} 
                      searchQuery={searchQuery}
                      refreshTrigger={refreshTrigger}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard" className="m-0">
              {isLoading ? (
                <UsersLoading />
              ) : error ? (
                <UsersError error={error as Error} onRetry={handleForceRefresh} />
              ) : (
                <UserStats users={users} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Client Detail Dialog */}
      <Dialog open={isClientDetailOpen} onOpenChange={setIsClientDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Client Data - CEO Report View</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <EnhancedClientDetailView
              client={selectedClient}
              onClose={() => setIsClientDetailOpen(false)}
              onCheckKyc={checkUserKyc}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;
