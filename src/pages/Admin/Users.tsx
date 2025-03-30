
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
import { Loader2, Search, Users, RefreshCw, DatabaseIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  wallet_address: string | null;
  email?: string;
  kyc_status?: string;
  created_at: string;
}

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // CRITICAL FIX: Use React Query for better data fetching and caching
  const fetchUsers = async () => {
    console.log('Fetching users for admin dashboard...');
    
    try {
      // CRITICAL FIX: First get all profiles in a separate dedicated query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log(`Fetched ${profiles?.length || 0} user profiles`);
      
      // CRITICAL FIX: Then get all KYC data in a separate dedicated query
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*');
      
      if (kycError) {
        console.error('Error fetching KYC data:', kycError);
        throw kycError;
      }
      
      console.log(`Fetched ${kycData?.length || 0} KYC records`);
      
      // CRITICAL FIX: Log raw KYC data for debugging
      console.log('Raw KYC data by user ID:');
      kycData?.forEach(kyc => {
        console.log(`User ID: ${kyc.user_id}, Status: ${kyc.status}, First Name: ${kyc.first_name}, Last Name: ${kyc.last_name}`);
      });
      
      // Create a map of user ID to KYC status for faster lookups
      const kycStatusMap = (kycData || []).reduce((map, kyc) => {
        map[kyc.user_id] = kyc.status;
        return map;
      }, {} as Record<string, string>);
      
      // CRITICAL FIX: Log the status map
      console.log('KYC status map by user ID:', kycStatusMap);
      
      // Enhance users with KYC status from the map
      const enhancedUsers = (profiles || []).map(profile => {
        // CRITICAL FIX: Log each user profile for debugging
        console.log(`Processing profile ID: ${profile.id}, First Name: ${profile.first_name}, Last Name: ${profile.last_name}`);
        
        // CRITICAL FIX: Add user KYC status directly from the map
        const userStatus = kycStatusMap[profile.id] || 'not_started';
        
        console.log(`User ${profile.id} KYC status: ${userStatus}`);
        
        return {
          ...profile,
          kyc_status: userStatus
        };
      });
      
      console.log('Enhanced users data ready:', enhancedUsers.length);
      
      if (enhancedUsers.length > 0) {
        console.log('First few users with KYC status:', enhancedUsers.slice(0, 3));
      }
      
      return enhancedUsers;
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
    // CRITICAL FIX: More aggressive refetching settings
    staleTime: 1000, // Consider data stale after 1 second
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
  useEffect(() => {
    // CRITICAL FIX: Force refresh on component mount
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
      .subscribe((status) => {
        console.log('Realtime subscription status for profiles:', status);
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
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status for KYC changes:', status);
      });
    
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
  
  const renderKycStatusBadge = (status?: string) => {
    if (!status) return null;
    
    // CRITICAL FIX: Make sure all status types are handled correctly
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Needs Clarification</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  const testDatabaseConnection = async () => {
    try {
      toast.info('Testing database connection...');
      
      // CRITICAL FIX: Enhanced database test that checks RLS and permissions
      console.log('Testing database connection for profiles and KYC tables...');
      
      // Test KYC table access
      const { data: kycTest, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*');
      
      if (kycError) {
        console.error('Error accessing KYC verifications:', kycError);
        toast.error('Failed to access KYC verifications table');
        return;
      }
      
      // Also test profiles table access
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error accessing profiles:', profilesError);
        toast.error('Failed to access profiles table');
        return;
      }
      
      // CRITICAL FIX: Log detailed information about what we found
      console.log('DB connection test results:', {
        profilesCount: profilesTest?.length || 0,
        kycCount: kycTest?.length || 0,
        kycStatusCounts: kycTest?.reduce((acc, kyc) => {
          acc[kyc.status] = (acc[kyc.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      console.log('All KYC records:', kycTest);
      console.log('All profiles:', profilesTest);
      
      // Inspect missing data issues - check if profiles have corresponding KYC records
      const profileIds = new Set(profilesTest?.map(p => p.id) || []);
      const kycUserIds = new Set(kycTest?.map(k => k.user_id) || []);
      
      const profilesWithoutKyc = [...profileIds].filter(id => !kycUserIds.has(id));
      const kycWithoutProfiles = [...kycUserIds].filter(id => !profileIds.has(id));
      
      console.log('Profiles without KYC records:', profilesWithoutKyc);
      console.log('KYC records without profiles:', kycWithoutProfiles);
      
      // Force all query invalidations
      queryClient.invalidateQueries();
      
      toast.success(`Database connection successful. Found ${profilesTest?.length || 0} profiles and ${kycTest?.length || 0} KYC records`);
      
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
            <Users className="h-5 w-5" />
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
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
                        <TableCell>{renderKycStatusBadge(user.kyc_status)}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredUsers.length === 0 && (
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
