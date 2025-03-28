
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/Admin/Layout';
import { toast } from 'sonner';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Wallet, Download } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  wallet_address?: string;
  transaction_count: number;
  total_spent: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(lowercaseSearchTerm) ||
        (user.first_name && user.first_name.toLowerCase().includes(lowercaseSearchTerm)) ||
        (user.last_name && user.last_name.toLowerCase().includes(lowercaseSearchTerm)) ||
        (user.wallet_address && user.wallet_address.toLowerCase().includes(lowercaseSearchTerm))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get profiles with user email
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name, 
          wallet_address, 
          email:id (email)
        `)
        .order('first_name', { ascending: true });
      
      if (profilesError) throw profilesError;
      
      // Get transaction counts and total spent per user
      const { data: transactionStats, error: statsError } = await supabase
        .from('transactions')
        .select('user_id, amount');
      
      if (statsError) throw statsError;
      
      // Process and combine the data
      const userMap = new Map();
      transactionStats.forEach(tx => {
        const userId = tx.user_id;
        const amount = Number(tx.amount);
        
        if (!userMap.has(userId)) {
          userMap.set(userId, { transaction_count: 0, total_spent: 0 });
        }
        
        const userStats = userMap.get(userId);
        userStats.transaction_count += 1;
        userStats.total_spent += amount;
        userMap.set(userId, userStats);
      });
      
      const formattedUsers = profiles.map((profile: any) => {
        const stats = userMap.get(profile.id) || { transaction_count: 0, total_spent: 0 };
        return {
          id: profile.id,
          email: profile.email?.[0]?.email || 'No email',
          first_name: profile.first_name,
          last_name: profile.last_name,
          wallet_address: profile.wallet_address,
          transaction_count: stats.transaction_count,
          total_spent: stats.total_spent
        };
      });
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users to export');
      return;
    }

    const headers = [
      'User ID',
      'Email',
      'First Name',
      'Last Name',
      'Wallet Address',
      'Transactions',
      'Total Spent'
    ];

    const csvData = filteredUsers.map(user => [
      user.id,
      user.email,
      user.first_name || '',
      user.last_name || '',
      user.wallet_address || '',
      user.transaction_count,
      user.total_spent.toFixed(2)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={filteredUsers.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Users Found</CardTitle>
              <CardDescription>
                {searchTerm ? 'No users match your search criteria.' : 'There are no users in the system yet.'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} {searchTerm && 'matching your search'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Wallet</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'Unknown Name'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.wallet_address ? (
                            <div className="flex items-center">
                              <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="truncate max-w-[200px]">{user.wallet_address}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.transaction_count}
                        </TableCell>
                        <TableCell className="text-right">
                          ${user.total_spent.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
