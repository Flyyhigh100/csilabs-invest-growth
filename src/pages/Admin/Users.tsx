
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
import { Loader2, Search, Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users for admin dashboard...');
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log(`Fetched ${profiles?.length || 0} user profiles`);
      
      // Then get all KYC data in a separate query
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*');
      
      if (kycError) {
        console.error('Error fetching KYC data:', kycError);
        throw kycError;
      }
      
      console.log(`Fetched ${kycData?.length || 0} KYC records`);
      console.log('KYC data:', kycData);
      
      // Create a map of user ID to KYC status
      const kycStatusMap = (kycData || []).reduce((map, kyc) => {
        map[kyc.user_id] = kyc.status;
        return map;
      }, {} as Record<string, string>);
      
      // Get user emails (requires admin permissions)
      const enhancedUsers = await Promise.all(
        (profiles || []).map(async (profile) => {
          // For simplicity, we'll just use the profile data directly
          return {
            ...profile,
            kyc_status: kycStatusMap[profile.id] || 'not_started'
          };
        })
      );
      
      console.log('Enhanced users data ready:', enhancedUsers.length);
      
      if (enhancedUsers.length > 0) {
        console.log('Sample user data:', enhancedUsers[0]);
      }
      
      setUsers(enhancedUsers);
      toast.success(`Loaded ${enhancedUsers.length} users`);
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setError(err as Error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    
    // Set up realtime subscription for KYC changes
    const channel = supabase
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
          fetchUsers(); // Refresh the entire user list
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status for KYC changes:', status);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
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
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) {
        console.error('Error accessing profiles:', profilesError);
        toast.error('Failed to access profiles table');
        return;
      }
      
      console.log('DB connection test results:', {
        profilesCount: profilesTest ? 'accessible' : 'no data',
        kycCount: kycTest?.length || 0,
        kycStatusCounts: kycTest?.reduce((acc, kyc) => {
          acc[kyc.status] = (acc[kyc.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      console.log('All KYC records:', kycTest);
      
      toast.success(`Database connection successful. Found ${kycTest?.length || 0} KYC records`);
      
      fetchUsers();
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
                Test DB Connection
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchUsers}
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
              <p>{error.message}</p>
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
