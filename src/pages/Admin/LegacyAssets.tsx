import React, { useState } from 'react';
import { Search, Users, TrendingUp, Plus, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Dashboard/Layout';
import { LEGACY_ASSET_TYPES } from '@/hooks/useLegacyAssets';
import AdminLegacyAssetManager from '@/components/Admin/LegacyAssets/AdminLegacyAssetManager';

interface UserLegacyAssetSummary {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_shares: number;
  total_value: number;
  asset_types_count: number;
  transactions_count: number;
  last_updated: string;
}

const AdminLegacyAssets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('total_value');
  const [selectedUser, setSelectedUser] = useState<UserLegacyAssetSummary | null>(null);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);

  // Fetch users with legacy assets
  const { data: usersWithAssets, isLoading } = useQuery({
    queryKey: ['admin-legacy-assets', searchTerm, selectedAssetType],
    queryFn: async () => {
      let query = supabase
        .from('user_legacy_assets')
        .select(`
          user_id,
          asset_type,
          amount,
          updated_at,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .gt('amount', 0);

      if (selectedAssetType !== 'all') {
        query = query.eq('asset_type', selectedAssetType);
      }

      const { data: legacyAssets, error } = await query;

      if (error) throw error;

      // Aggregate data by user
      const userSummaries: Record<string, UserLegacyAssetSummary> = {};

      legacyAssets?.forEach((asset: any) => {
        const userId = asset.user_id;
        const profile = asset.profiles;

        if (!profile) return;

        if (!userSummaries[userId]) {
          userSummaries[userId] = {
            user_id: userId,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            total_shares: 0,
            total_value: 0,
            asset_types_count: 0,
            transactions_count: 0,
            last_updated: asset.updated_at
          };
        }

        userSummaries[userId].total_shares += asset.amount;
        userSummaries[userId].asset_types_count += 1;
        userSummaries[userId].total_value += asset.amount * 0.01; // Placeholder value calculation

        // Update last_updated to the most recent
        if (new Date(asset.updated_at) > new Date(userSummaries[userId].last_updated)) {
          userSummaries[userId].last_updated = asset.updated_at;
        }
      });

      let users = Object.values(userSummaries);

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        users = users.filter(user =>
          user.first_name.toLowerCase().includes(term) ||
          user.last_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        );
      }

      // Sort users
      users.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          case 'email':
            return a.email.localeCompare(b.email);
          case 'total_shares':
            return b.total_shares - a.total_shares;
          case 'total_value':
            return b.total_value - a.total_value;
          case 'last_updated':
            return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
          default:
            return 0;
        }
      });

      return users;
    },
  });

  // Calculate summary statistics
  const totalUsers = usersWithAssets?.length || 0;
  const totalShares = usersWithAssets?.reduce((sum, user) => sum + user.total_shares, 0) || 0;
  const totalValue = usersWithAssets?.reduce((sum, user) => sum + user.total_value, 0) || 0;
  const totalTransactions = usersWithAssets?.reduce((sum, user) => sum + user.transactions_count, 0) || 0;

  const handleManageAssets = (user: UserLegacyAssetSummary) => {
    setSelectedUser(user);
    setIsAssetManagerOpen(true);
  };

  const handleCloseAssetManager = () => {
    setSelectedUser(null);
    setIsAssetManagerOpen(false);
  };

  return (
    <DashboardLayout title="Legacy Assets Management">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">With legacy assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all asset types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Placeholder calculation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Search and filter users with legacy asset holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Asset Types</SelectItem>
                {LEGACY_ASSET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_value">Total Value</SelectItem>
                <SelectItem value="total_shares">Total Shares</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="last_updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Legacy Asset Holdings</CardTitle>
          <CardDescription>
            Detailed view of all users with legacy asset holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading user data...</p>
            </div>
          ) : usersWithAssets?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found with legacy assets.</p>
              <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Shares</TableHead>
                    <TableHead>Asset Types</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithAssets?.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="font-mono">
                        {user.total_shares.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.asset_types_count} type{user.asset_types_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.transactions_count > 0 ? "default" : "outline"}>
                          {user.transactions_count} transaction{user.transactions_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.last_updated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleManageAssets(user)}
                        >
                          Manage Assets
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Legacy Asset Manager Modal */}
      {selectedUser && (
        <AdminLegacyAssetManager
          isOpen={isAssetManagerOpen}
          onClose={handleCloseAssetManager}
          user={selectedUser}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminLegacyAssets;