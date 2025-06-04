import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, Wallet, RefreshCw, Shield } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import UserDetailView from './UserDetailView';
import UserAuthDetailDialog from './UserAuthDetailDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TestIconLucide } from '@/components/icons/TestIcon';
import { useUserAuthDetails } from '@/hooks/admin/useUserAuthDetails';

// Import the useTestDataToggle hook to synchronize test data visibility
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';

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
  has_test_data?: boolean;
  test_transaction_count?: number;
  test_transaction_value?: number;
}

interface TransactionStats {
  // Total counts for all non-test transactions
  count: number;
  value: number;
  latest?: string;
  
  // Completed non-test transactions (real value)
  completed_count: number;
  completed_value: number;
  
  // Pending non-test transactions (actual pending status)
  pending_count: number;
  pending_value: number;
  
  // Cancelled non-test transactions
  cancelled_count: number;
  cancelled_value: number;
  
  // Failed non-test transactions
  failed_count: number;
  failed_value: number;
  
  // Test transactions
  test_count: number;
  test_value: number;
  test_latest?: string; 
  
  // Test completed transactions
  test_completed_count: number;
  test_completed_value: number;
}

interface EnhancedUser extends User {
  transaction_count: number;
  transaction_value: number;
  completed_transaction_count: number;
  completed_transaction_value: number;
  pending_transaction_count: number;
  pending_transaction_value: number;
  cancelled_transaction_count: number;
  cancelled_transaction_value: number;
  failed_transaction_count: number;
  failed_transaction_value: number;
  latest_transaction?: string;
  test_transaction_count: number;
  test_transaction_value: number;
  test_completed_count: number;
  test_completed_value: number;
  test_latest_transaction?: string;
  has_test_data: boolean;
}

interface EnhancedUsersTableProps {
  users: User[];
  onCheckKyc: (userId: string) => void;
  searchQuery: string;
  refreshTrigger?: number; // New prop to force refresh
}

const EnhancedUsersTable: React.FC<EnhancedUsersTableProps> = ({ 
  users, 
  onCheckKyc, 
  searchQuery,
  refreshTrigger = 0
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAuthDetailDialogOpen, setIsAuthDetailDialogOpen] = useState(false);
  const [isLoadingTransactionStats, setIsLoadingTransactionStats] = useState(false);
  
  // Get access to the QueryClient for manual cache invalidation
  const queryClient = useQueryClient();
  
  // Get the test data toggle state
  const { includeTestData } = useTestDataToggle();
  
  // Force refresh stats by incrementing this counter
  const [statsRefreshCounter, setStatsRefreshCounter] = useState(0);
  
  // User auth details hook
  const { authDetails, isLoading: isLoadingAuthDetails, fetchUserAuthDetails } = useUserAuthDetails();
  
  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`EnhancedUsersTable: refreshTrigger changed to ${refreshTrigger}, refreshing transaction stats`);
      setStatsRefreshCounter(prev => prev + 1);
    }
  }, [refreshTrigger]);
  
  // Add an effect to refresh transaction stats when includeTestData changes
  useEffect(() => {
    // Invalidate transaction stats when test data toggle changes
    console.log('Test data toggle changed, refreshing transaction stats');
    queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
    setStatsRefreshCounter(prev => prev + 1);
  }, [includeTestData, queryClient]);
  
  // Set up realtime subscription specific to this component
  useEffect(() => {
    console.log('Setting up realtime subscription for transaction stats');
    
    const channel = supabase
      .channel('enhanced-users-table-tx-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction update received in EnhancedUsersTable:', payload.eventType);
          
          // For status changes, force an immediate refresh
          if (payload.eventType === 'UPDATE') {
            const oldData = payload.old as any;
            const newData = payload.new as any;
            
            if (oldData.status !== newData.status) {
              console.log(`EnhancedUsersTable: Transaction status changed from ${oldData.status} to ${newData.status}`);
              
              // Force immediate refresh
              setStatsRefreshCounter(prev => prev + 1);
              
              // Explicitly invalidate the transaction stats
              queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
              
              // If status changed to completed, show a more visible notification
              if (newData.status === 'completed' && oldData.status !== 'completed') {
                console.log('Transaction completed, refreshing stats immediately');
                setTimeout(() => {
                  setStatsRefreshCounter(prev => prev + 1);
                }, 500);
              }
            }
          } else {
            // For other changes, also refresh
            setStatsRefreshCounter(prev => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log(`EnhancedUsersTable transaction subscription status: ${status}`);
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // Fetch transaction stats for all users with separate test and real data
  const { data: transactionStats = {}, refetch: refetchTransactionStats } = useQuery({
    queryKey: ['user-transaction-stats', statsRefreshCounter, includeTestData],
    queryFn: async () => {
      setIsLoadingTransactionStats(true);
      try {
        console.log("Fetching transaction stats for all users with test/real and status separation");
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            user_id,
            amount,
            created_at,
            status,
            is_test
          `);
          
        if (error) throw error;
        
        const stats: Record<string, TransactionStats> = {};
        
        // Process transaction data separating test/real and completed/pending/cancelled/failed
        data.forEach(tx => {
          if (!tx.user_id) return;
          
          const status = tx.status?.toLowerCase() || '';
          const isCompleted = status === 'completed';
          const isPending = status === 'pending' || status === 'processing';
          const isCancelled = status === 'cancelled' || status === 'expired';
          const isFailed = status === 'failed' || status === 'error';
          
          if (!stats[tx.user_id]) {
            stats[tx.user_id] = { 
              count: 0, 
              value: 0,
              completed_count: 0,
              completed_value: 0, 
              pending_count: 0,
              pending_value: 0,
              cancelled_count: 0,
              cancelled_value: 0,
              failed_count: 0,
              failed_value: 0,
              test_count: 0,
              test_value: 0,
              test_completed_count: 0,
              test_completed_value: 0
            };
          }
          
          if (tx.is_test) {
            // Test transaction
            stats[tx.user_id].test_count++;
            stats[tx.user_id].test_value += Number(tx.amount || 0);
            
            // Track completed test transactions separately
            if (isCompleted) {
              stats[tx.user_id].test_completed_count++;
              stats[tx.user_id].test_completed_value += Number(tx.amount || 0);
            }
            
            // Track latest test transaction
            if (!stats[tx.user_id].test_latest || 
                new Date(tx.created_at) > new Date(stats[tx.user_id].test_latest!)) {
              stats[tx.user_id].test_latest = tx.created_at;
            }
          } else {
            // Real transaction (non-test)
            stats[tx.user_id].count++;
            stats[tx.user_id].value += Number(tx.amount || 0);
            
            if (isCompleted) {
              // Completed real transaction
              stats[tx.user_id].completed_count++;
              stats[tx.user_id].completed_value += Number(tx.amount || 0);
            } else if (isPending) {
              // Pending real transaction (only actual pending/processing status)
              stats[tx.user_id].pending_count++;
              stats[tx.user_id].pending_value += Number(tx.amount || 0);
            } else if (isCancelled) {
              // Cancelled real transaction
              stats[tx.user_id].cancelled_count++;
              stats[tx.user_id].cancelled_value += Number(tx.amount || 0);
            } else if (isFailed) {
              // Failed real transaction
              stats[tx.user_id].failed_count++;
              stats[tx.user_id].failed_value += Number(tx.amount || 0);
            }
            
            // Track latest real transaction
            if (!stats[tx.user_id].latest || 
                new Date(tx.created_at) > new Date(stats[tx.user_id].latest!)) {
              stats[tx.user_id].latest = tx.created_at;
            }
          }
        });
        
        console.log(`Fetched transaction stats for ${Object.keys(stats).length} users with test/real and status separation`);
        console.log('Sample of stats:', Object.entries(stats).slice(0, 2).map(([userId, userStats]) => ({
          userId,
          pending_count: userStats.pending_count,
          pending_value: userStats.pending_value,
          completed_count: userStats.completed_count
        })));
        
        return stats;
      } catch (err) {
        console.error('Error fetching transaction stats:', err);
        return {};
      } finally {
        setIsLoadingTransactionStats(false);
      }
    },
    // Set a very short stale time to ensure frequent refreshes
    staleTime: 5000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Function to manually refresh transaction stats
  const handleRefreshStats = () => {
    console.log('Manually refreshing transaction stats');
    setStatsRefreshCounter(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
    refetchTransactionStats();
  };

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
    const stats = transactionStats[user.id] || { 
      count: 0, 
      value: 0,
      completed_count: 0,
      completed_value: 0,
      pending_count: 0,
      pending_value: 0,
      cancelled_count: 0,
      cancelled_value: 0,
      failed_count: 0,
      failed_value: 0,
      test_count: 0,
      test_value: 0,
      test_completed_count: 0,
      test_completed_value: 0
    };
    
    return {
      ...user,
      transaction_count: stats.count,
      transaction_value: stats.value,
      completed_transaction_count: stats.completed_count,
      completed_transaction_value: stats.completed_value,
      pending_transaction_count: stats.pending_count,
      pending_transaction_value: stats.pending_value,
      cancelled_transaction_count: stats.cancelled_count,
      cancelled_transaction_value: stats.cancelled_value,
      failed_transaction_count: stats.failed_count,
      failed_transaction_value: stats.failed_value,
      latest_transaction: stats.latest,
      test_transaction_count: stats.test_count,
      test_transaction_value: stats.test_value,
      test_completed_count: stats.test_completed_count,
      test_completed_value: stats.test_completed_value,
      test_latest_transaction: stats.test_latest,
      has_test_data: stats.test_count > 0
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

  const handleViewAuthDetails = (user: User) => {
    setSelectedUser(user);
    fetchUserAuthDetails(user.id);
    setIsAuthDetailDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {isLoadingTransactionStats ? 'Loading transaction data...' : 'Transaction data loaded'}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshStats}
          disabled={isLoadingTransactionStats}
          className={statsRefreshCounter > 0 ? "border-blue-500" : ""}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTransactionStats ? 'animate-spin' : ''}`} />
          Refresh Transaction Stats
        </Button>
      </div>
    
      {/* Custom horizontal scroll container with floating scrollbar */}
      <div className="relative">
        {/* Floating horizontal scrollbar at the top */}
        <div className="w-full overflow-x-auto mb-2 bg-gray-100 rounded-md p-1">
          <div className="min-w-[1200px] h-2 bg-transparent"></div>
        </div>
        
        {/* Table container with synchronized horizontal scroll */}
        <div 
          className="w-full overflow-x-auto border rounded-md"
          onScroll={(e) => {
            // Sync the top scrollbar with the table scroll
            const topScrollbar = e.currentTarget.previousElementSibling?.querySelector('div > div') as HTMLElement;
            if (topScrollbar) {
              topScrollbar.parentElement!.scrollLeft = e.currentTarget.scrollLeft;
            }
          }}
        >
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[180px]">Wallet Address</TableHead>
                  <TableHead className="min-w-[120px]">KYC Status</TableHead>
                  <TableHead className="text-right min-w-[140px]">
                    Transactions{' '}
                    {isLoadingTransactionStats && (
                      <RefreshCw className="h-3 w-3 inline-block animate-spin ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="min-w-[160px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>Value <span className="text-xs text-green-600">(Real*)</span></div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="text-xs">
                            <div className="font-semibold">Value (Real*)</div>
                            <div>Only completed, non-test transactions</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="min-w-[300px]">Actions</TableHead>
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
                        {/* Display the real transaction count */}
                        <span>{user.transaction_count}</span>
                        
                        {/* Test data indicator */}
                        {user.has_test_data && (
                          <span className="inline-flex items-center">
                            <TestIconLucide className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs text-amber-500 ml-0.5">+{user.test_transaction_count}</span>
                          </span>
                        )}
                        
                        {/* Add status indicators for pending/cancelled/failed transactions */}
                        <div className="flex flex-wrap gap-1 justify-end mt-1">
                          {user.pending_transaction_count > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">
                              {user.pending_transaction_count} pending
                            </Badge>
                          )}
                          {user.cancelled_transaction_count > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-gray-50 text-gray-700 border-gray-200">
                              {user.cancelled_transaction_count} cancelled
                            </Badge>
                          )}
                          {user.failed_transaction_count > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-red-50 text-red-700 border-red-200">
                              {user.failed_transaction_count} failed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                {/* Display the real transaction count */}
                                <span>{user.transaction_count}</span>
                                
                                {/* Test data indicator */}
                                {user.has_test_data && (
                                  <span className="inline-flex items-center">
                                    <TestIconLucide className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-xs text-amber-500 ml-0.5">+{user.test_transaction_count}</span>
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="w-64">
                              <div className="text-xs">
                                <div className="font-semibold">Transaction Stats:</div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                                  <div className="font-semibold text-green-600">Real (completed):</div>
                                  <div className="text-right text-green-600">{user.completed_transaction_count}</div>
                                  <div className="text-green-600">Real value:</div>
                                  <div className="text-right text-green-600">{formatCurrency(user.completed_transaction_value)}</div>
                                  
                                  {user.pending_transaction_count > 0 && (
                                    <>
                                      <div className="text-amber-600">Pending transactions:</div>
                                      <div className="text-right text-amber-600">{user.pending_transaction_count}</div>
                                      <div className="text-amber-600">Pending value:</div>
                                      <div className="text-right text-amber-600">{formatCurrency(user.pending_transaction_value)}</div>
                                    </>
                                  )}
                                  
                                  {user.cancelled_transaction_count > 0 && (
                                    <>
                                      <div className="text-gray-600">Cancelled transactions:</div>
                                      <div className="text-right text-gray-600">{user.cancelled_transaction_count}</div>
                                      <div className="text-gray-600">Cancelled value:</div>
                                      <div className="text-right text-gray-600">{formatCurrency(user.cancelled_transaction_value)}</div>
                                    </>
                                  )}
                                  
                                  {user.failed_transaction_count > 0 && (
                                    <>
                                      <div className="text-red-600">Failed transactions:</div>
                                      <div className="text-right text-red-600">{user.failed_transaction_count}</div>
                                      <div className="text-red-600">Failed value:</div>
                                      <div className="text-right text-red-600">{formatCurrency(user.failed_transaction_value)}</div>
                                    </>
                                  )}
                                  
                                  <div>Total transactions:</div>
                                  <div className="text-right">{user.transaction_count}</div>
                                  <div>Total value:</div>
                                  <div className="text-right">{formatCurrency(user.transaction_value)}</div>
                                  
                                  {user.latest_transaction && (
                                    <>
                                      <div>Last real TX:</div>
                                      <div className="text-right">{new Date(user.latest_transaction).toLocaleDateString()}</div>
                                    </>
                                  )}
                                  
                                  {user.has_test_data && (
                                    <>
                                      <div className="text-amber-600 font-semibold mt-1">Test transactions:</div>
                                      <div className="text-amber-600 text-right mt-1">{user.test_transaction_count}</div>
                                      <div className="text-amber-600">Test value:</div>
                                      <div className="text-amber-600 text-right">{formatCurrency(user.test_transaction_value)}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewAuthDetails(user)}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Auth Details
                          </Button>
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
        </div>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground flex items-center">
        <span className="text-green-600 font-semibold mr-1">*Real Value:</span> Only completed, non-test transactions are counted as real value.
        <div className="ml-auto flex items-center gap-2">
          <span className="text-amber-600">Pending</span>
          <span className="text-gray-600">Cancelled</span>
          <span className="text-red-600">Failed</span>
        </div>
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

      {/* User Auth Detail Dialog */}
      <UserAuthDetailDialog
        open={isAuthDetailDialogOpen}
        onOpenChange={setIsAuthDetailDialogOpen}
        authDetails={authDetails}
        isLoading={isLoadingAuthDetails}
      />
    </>
  );
};

export default EnhancedUsersTable;
