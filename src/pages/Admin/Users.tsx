
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Users as UsersIcon, RefreshCw, DatabaseIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
  kyc_status?: string;
  has_kyc_record?: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use direct edge function call to fetch users
  const fetchUsers = async () => {
    console.log('Fetching users for admin dashboard...');
    
    try {
      // Use the edge function to get all users
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'getAllUsers',
          data: {}
        }
      });
      
      if (error) {
        console.error('Error calling admin-operations function:', error);
        throw error;
      }
      
      if (!data || data.error) {
        console.error('Error in function response:', data?.error || 'No data returned');
        throw new Error(data?.error?.message || 'Failed to fetch users');
      }
      
      console.log(`Fetched ${data.users?.length || 0} users with details`);
      return data.users || [];
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      throw err;
    }
  };
  
  const { 
    data: users = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
    staleTime: 1000, // Consider data stale after 1 second
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
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
    
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(kycChannel);
    };
  }, [refetch]);
  
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.wallet_address && user.wallet_address.toLowerCase().includes(searchLower))
    );
  });
  
  const renderKycStatusBadge = (status?: string, hasKycRecord?: boolean) => {
    if (hasKycRecord === false) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> No KYC Record
      </Badge>;
    }
    
    if (!status) return null;
    
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Needs Clarification</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const checkUserKyc = async (userId: string) => {
    try {
      toast.info(`Checking KYC status for user ${userId}...`);
      await refetch();
      toast.success('User data refreshed');
    } catch (error) {
      console.error(`Error checking KYC for user ${userId}:`, error);
      toast.error('Error refreshing user data');
    }
  };
  
  const testDatabaseConnection = async () => {
    try {
      toast.info('Testing database connection...');
      
      // Enhanced database test
      const { data: kycTest, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('count()', { count: 'exact' });
      
      if (kycError) {
        console.error('Error accessing KYC verifications:', kycError);
        toast.error('Failed to access KYC verifications table');
        return;
      }
      
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('count()', { count: 'exact' });
      
      if (profilesError) {
        console.error('Error accessing profiles:', profilesError);
        toast.error('Failed to access profiles table');
        return;
      }
      
      const kycCount = kycTest && kycTest[0] ? kycTest[0].count : 0;
      const profilesCount = profilesTest && profilesTest[0] ? profilesTest[0].count : 0;
      
      console.log(`Database connection test results: ${profilesCount} profiles, ${kycCount} KYC records`);
      
      toast.success(`Database connection successful. Found ${profilesCount} profiles and ${kycCount} KYC records`);
      
      // Refresh data
      refetch();
    } catch (err) {
      console.error('Database test error:', err);
      toast.error('Database test failed');
    }
  };
  
  return (
    <AdminLayout title="Users">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search"
                placeholder="Search users..." 
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={testDatabaseConnection}
                className="flex items-center gap-2"
              >
                <DatabaseIcon className="h-4 w-4" />
                Test DB Connection
              </Button>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <h3 className="font-bold">Error loading users</h3>
              <p>{(error as Error).message}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="font-mono text-xs truncate max-w-[150px]">
                              {user.wallet_address || 'Not set'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderKycStatusBadge(user.kyc_status, user.has_kyc_record)}
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => checkUserKyc(user.id)}
                            >
                              Check KYC
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredUsers.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users match your search criteria</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsersPage;
