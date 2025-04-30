
import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, Wallet, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import UserDetailView from './UserDetailView';

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
  kyc_complete?: boolean;
  kyc_id?: string;
}

interface EnhancedUser extends User {
  transaction_count: number;
  transaction_value: number;
  latest_transaction?: string;
}

interface EnhancedUsersTableProps {
  users: User[];
  onCheckKyc: (userId: string) => void;
  searchQuery: string;
}

const EnhancedUsersTable: React.FC<EnhancedUsersTableProps> = ({ 
  users, 
  onCheckKyc, 
  searchQuery 
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingTransactionStats, setIsLoadingTransactionStats] = useState(false);
  
  // Fetch transaction stats for all users
  const { data: transactionStats = {} } = useQuery({
    queryKey: ['user-transaction-stats'],
    queryFn: async () => {
      setIsLoadingTransactionStats(true);
      try {
        console.log("Fetching transaction stats for all users");
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            user_id,
            amount,
            created_at,
            status
          `);
          
        if (error) throw error;
        
        const stats: Record<string, { 
          count: number; 
          value: number;
          latest?: string;
        }> = {};
        
        // Process transaction data
        data.forEach(tx => {
          if (!tx.user_id) return;
          
          if (!stats[tx.user_id]) {
            stats[tx.user_id] = { count: 0, value: 0 };
          }
          
          stats[tx.user_id].count++;
          stats[tx.user_id].value += Number(tx.amount || 0);
          
          // Track latest transaction
          if (!stats[tx.user_id].latest || 
              new Date(tx.created_at) > new Date(stats[tx.user_id].latest!)) {
            stats[tx.user_id].latest = tx.created_at;
          }
        });
        
        console.log(`Fetched transaction stats for ${Object.keys(stats).length} users`);
        return stats;
      } catch (err) {
        console.error('Error fetching transaction stats:', err);
        return {};
      } finally {
        setIsLoadingTransactionStats(false);
      }
    }
  });

  const renderKycStatusBadge = (status?: string, hasKycRecord?: boolean, kycComplete?: boolean) => {
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
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {kycComplete ? 'Pending Review' : 'Pending Completion'}
        </Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Needs Clarification</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const enhancedUsers: EnhancedUser[] = users.map(user => {
    const stats = transactionStats[user.id] || { count: 0, value: 0 };
    return {
      ...user,
      transaction_count: stats.count,
      transaction_value: stats.value,
      latest_transaction: stats.latest
    };
  });

  const filteredUsers = enhancedUsers.filter(user => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.wallet_address && user.wallet_address.toLowerCase().includes(searchLower))
    );
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead className="text-right">
                Transactions{' '}
                {isLoadingTransactionStats && (
                  <RefreshCw className="h-3 w-3 inline-block animate-spin ml-1" />
                )}
              </TableHead>
              <TableHead>Value</TableHead>
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
                    {user.wallet_address ? (
                      <div className="flex items-center">
                        <Wallet className="h-3 w-3 mr-1" />
                        <div className="font-mono text-xs truncate max-w-[150px]">
                          {user.wallet_address}
                        </div>
                      </div>
                    ) : 'Not set'}
                  </TableCell>
                  <TableCell>
                    {renderKycStatusBadge(user.kyc_status, user.has_kyc_record, user.kyc_complete)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {user.transaction_count}
                    {user.latest_transaction && (
                      <span className="block text-xs text-muted-foreground">
                        Last: {new Date(user.latest_transaction).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.transaction_value > 0 ? formatCurrency(user.transaction_value) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCheckKyc(user.id)}
                      >
                        Check KYC
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <UserDetailView user={selectedUser} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedUsersTable;
