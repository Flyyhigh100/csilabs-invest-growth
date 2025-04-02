
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
import { Loader2, Search, Users, RefreshCw, DatabaseIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllUsersWithKycStatus, checkUserKycRecord } from '@/components/Admin/KYC/KycVerificationsService';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
  kyc_status?: string;
  // Define types for auth data which isn't in profiles table
  auth_email?: string | null;
  // CRITICAL FIX: Add has_kyc_record flag
  has_kyc_record?: boolean;
}

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [userKycCheckResults, setUserKycCheckResults] = useState<Record<string, boolean>>({});
  
  // CRITICAL FIX: Use a more direct and reliable approach to fetch users and their KYC status
  const fetchUsers = async () => {
    console.log('Fetching users for admin dashboard...');
    
    try {
      // CRITICAL FIX: Get users with KYC status in one operation
      const usersWithKyc = await listAllUsersWithKycStatus();
      
      if (!usersWithKyc || usersWithKyc.length === 0) {
        console.warn('No users found or error fetching users with KYC status');
      } else {
        console.log(`Fetched ${usersWithKyc.length} users with KYC status`);
      }
      
      // CRITICAL FIX: Get auth users to obtain email information 
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Don't throw here, we'll just proceed without emails
      }
      
      // Create a map of user ID to email for faster lookups
      const emailMap = (authUsers?.users || []).reduce((acc, user) => {
        acc[user.id] = user.email;
        return acc;
      }, {} as Record<string, string | undefined>);
      
      console.log('Email map by user ID:', emailMap);
      
      // CRITICAL FIX: Log KYC status before sending to UI
      usersWithKyc.forEach(user => {
        console.log(`User ${user.id} KYC status: ${user.kyc_status}, Has KYC: ${user.has_kyc}`);
      });
      
      // Enhance users with email data
      const enhancedUsers = usersWithKyc.map(user => ({
        ...user,
        auth_email: emailMap[user.id] || null,
        has_kyc_record: user.has_kyc
      }));
      
      console.log('Enhanced users data ready:', enhancedUsers.length);
      
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
      (user.auth_email && user.auth_email.toLowerCase().includes(searchLower)) ||
      (user.wallet_address && user.wallet_address.toLowerCase().includes(searchLower))
    );
  });
  
  const renderKycStatusBadge = (status?: string, hasKycRecord?: boolean) => {
    // CRITICAL FIX: Show warning if no KYC record found
    if (hasKycRecord === false) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> No KYC Record
      </Badge>;
    }
    
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
  
  // CRITICAL FIX: Add function to check if a specific user has a KYC record
  const checkUserKyc = async (userId: string) => {
    try {
      const result = await checkUserKycRecord(userId);
      const hasRecord = !!result;
      
      setUserKycCheckResults(prev => ({
        ...prev,
        [userId]: hasRecord
      }));
      
      toast.info(`KYC check for user ${userId}: ${hasRecord ? 'Record found' : 'No record found'}`);
      
      return hasRecord;
    } catch (error) {
      console.error(`Error checking KYC for user ${userId}:`, error);
      return false;
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
      
      // CRITICAL FIX: Check for missing data issues - check if profiles have corresponding KYC records
      const profileIds = new Set(profilesTest?.map(p => p.id) || []);
      const kycUserIds = new Set(kycTest?.map(k => k.user_id) || []);
      
      const profilesWithoutKyc = [...profileIds].filter(id => !kycUserIds.has(id));
      const kycWithoutProfiles = [...kycUserIds].filter(id => !profileIds.has(id));
      
      console.log('Profiles without KYC records:', profilesWithoutKyc);
      console.log('KYC records without profiles:', kycWithoutProfiles);
      
      // CRITICAL FIX: Create test KYC records for any profile that doesn't have one (for debugging)
      if (profilesWithoutKyc.length > 0) {
        console.log(`Creating test KYC records for ${profilesWithoutKyc.length} profiles without KYC...`);
        for (const profileId of profilesWithoutKyc.slice(0, 3)) { // Limit to first 3 to avoid creating too many
          const now = new Date().toISOString();
          const { data, error } = await supabase
            .from('kyc_verifications')
            .insert({
              user_id: profileId,
              status: 'not_started',
              first_name: null,
              last_name: null,
              created_at: now,
              updated_at: now
            });
            
          if (error) {
            console.error(`Error creating test KYC record for profile ${profileId}:`, error);
          } else {
            console.log(`Created test KYC record for profile ${profileId}`);
          }
        }
      }
      
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.auth_email || 'N/A'}</TableCell>
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
