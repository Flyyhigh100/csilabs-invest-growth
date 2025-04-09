
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent 
} from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Copy, Loader2, CreditCard, DollarSign, Wallet,
  ClipboardCheck, Search, Filter, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { markTokensAsSent } from '@/utils/admin';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  payment_method: string;
  status: string;
  transaction_id: string;
  wallet_address: string;
  token_sent: boolean | null;
  blockchain_tx_id?: string;
}

interface UserData {
  first_name: string | null;
  last_name: string | null;
  email?: string;
}

const fetchPendingTransactions = async (): Promise<Transaction[]> => {
  // Fetch transactions that are successful payments but haven't had tokens sent yet
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'completed')
    .eq('token_sent', false)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const fetchAllTransactions = async (): Promise<Transaction[]> => {
  // Fetch all transactions for the history tab
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return data || [];
};

const fetchUserData = async (userId: string): Promise<UserData | null> => {
  // Fetch user profile data
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }
  
  // Fetch auth user email (requires admin rights)
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
  
  if (userError) {
    console.error('Error fetching user email:', userError);
    return {
      ...profileData,
      email: undefined
    };
  }
  
  return {
    ...profileData,
    email: userData?.user?.email
  };
};

const PendingTransactions: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [blockchainTxId, setBlockchainTxId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  
  const {
    data: pendingTransactions,
    isLoading: isLoadingPending,
    error: pendingError,
    refetch: refetchPending
  } = useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: fetchPendingTransactions,
  });
  
  const {
    data: allTransactions,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll
  } = useQuery({
    queryKey: ['admin-all-transactions'],
    queryFn: fetchAllTransactions,
  });

  // Set up realtime subscription
  useEffect(() => {
    const transactionsChannel = supabase
      .channel('admin-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          toast.info('Transaction data updated');
          refetchPending();
          refetchAll();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(transactionsChannel);
    };
  }, [refetchPending, refetchAll]);
  
  const handleConfirmClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setBlockchainTxId(''); // Reset the blockchain transaction ID
    
    try {
      const userData = await fetchUserData(transaction.user_id);
      setUserData(userData);
      setConfirmDialogOpen(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data');
    }
  };
  
  const handleConfirmSent = async () => {
    if (!selectedTransaction) return;
    
    if (!blockchainTxId.trim()) {
      toast.error('Please enter a blockchain transaction ID');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Update the transaction with blockchain tx ID and mark as sent
      const { error } = await supabase
        .from('transactions')
        .update({
          token_sent: true,
          status: 'completed',
          blockchain_tx_id: blockchainTxId.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTransaction.id);
        
      if (error) {
        throw error;
      }
      
      // Send notification to the user
      await supabase.from('notifications').insert({
        user_id: selectedTransaction.user_id,
        title: 'Tokens Sent',
        message: `Your purchase of ${selectedTransaction.amount} USD worth of tokens has been processed. Tokens have been sent to your wallet.`,
        type: 'token_transfer'
      });
      
      toast.success('Transaction confirmed and notification sent');
      setConfirmDialogOpen(false);
      refetchPending();
      refetchAll();
    } catch (error) {
      console.error('Error confirming transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        toast.success('Wallet address copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy address');
      });
  };

  const handleRefresh = () => {
    refetchPending();
    refetchAll();
    toast.info('Refreshing transaction data...');
  };
  
  const filteredTransactions = (transactions: Transaction[] | undefined) => {
    if (!transactions) return [];
    
    return transactions.filter(tx => {
      const matchesSearch = 
        searchQuery === '' || 
        tx.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.blockchain_tx_id && tx.blockchain_tx_id.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesFilter = filterMethod === null || tx.payment_method === filterMethod;
      
      return matchesSearch && matchesFilter;
    });
  };
  
  const pendingCount = pendingTransactions?.length || 0;
  const pendingAmount = pendingTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
  
  const renderTransactionStatus = (transaction: Transaction) => {
    if (transaction.token_sent) {
      return (
        <Badge className="bg-green-500">
          <Check className="h-3 w-3 mr-1" />
          Tokens Sent
        </Badge>
      );
    } else if (transaction.status === 'completed') {
      return (
        <Badge className="bg-amber-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Payment Complete, Tokens Pending
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-500">
          <CreditCard className="h-3 w-3 mr-1" />
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </Badge>
      );
    }
  };
  
  if (isLoadingPending && activeTab === 'pending') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }
  
  if (pendingError && activeTab === 'pending') {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading transactions</h3>
        <p>{(pendingError as Error).message}</p>
      </div>
    );
  }
  
  const renderEmptyState = (tabId: string) => (
    <Card>
      <CardContent className="py-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No {tabId === 'pending' ? 'Pending' : ''} Transactions</h3>
        <p className="text-gray-500">
          {tabId === 'pending' 
            ? 'All successful transactions have been processed. There are no pending token transfers.'
            : 'No transaction records found.'}
        </p>
        <Button variant="outline" onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
  
  const renderTransactionsTable = (transactions: Transaction[] | undefined, isPending: boolean = false) => {
    const filtered = filteredTransactions(transactions);
    
    if (filtered.length === 0) {
      return renderEmptyState(isPending ? 'pending' : 'all');
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>Status</TableHead>
            {isPending && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.created_at).toLocaleDateString()} 
                <span className="text-gray-500 ml-2 text-xs">
                  {new Date(transaction.created_at).toLocaleTimeString()}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {transaction.transaction_id.length > 12 
                  ? `${transaction.transaction_id.substring(0, 12)}...` 
                  : transaction.transaction_id}
              </TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell className="capitalize">{transaction.payment_method}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="font-mono text-xs truncate max-w-[120px]">
                    {transaction.wallet_address}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopyAddress(transaction.wallet_address)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{renderTransactionStatus(transaction)}</TableCell>
              {isPending && (
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleConfirmClick(transaction)}
                    disabled={transaction.token_sent === true}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    {transaction.token_sent ? 'Completed' : 'Mark Sent'}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Token Distribution Management</h3>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {pendingCount > 0 && (
        <Card className="bg-amber-50 border-amber-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-800">Token Transfers Pending</h4>
                <p className="text-amber-700 text-sm">
                  There {pendingCount === 1 ? 'is' : 'are'} <strong>{pendingCount}</strong> payment{pendingCount !== 1 ? 's' : ''} waiting for token distribution,
                  totaling <strong>${pendingAmount.toFixed(2)}</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>
            Process token transfers and view transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by wallet address or transaction ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter" className="whitespace-nowrap text-sm">Filter:</Label>
              <select
                id="filter"
                className="p-2 border rounded text-sm"
                value={filterMethod || ''}
                onChange={(e) => setFilterMethod(e.target.value || null)}
              >
                <option value="">All Methods</option>
                <option value="stripe">Stripe</option>
                <option value="crypto">Crypto</option>
                <option value="coinpayments">CoinPayments</option>
              </select>
            </div>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending Transfers
                {pendingCount > 0 && (
                  <Badge className="ml-2 bg-amber-500">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {isLoadingPending ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-cbis-blue" />
                </div>
              ) : (
                renderTransactionsTable(pendingTransactions, true)
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {isLoadingAll ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-cbis-blue" />
                </div>
              ) : (
                renderTransactionsTable(allTransactions)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Confirm Token Sent Dialog */}
      {selectedTransaction && (
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Token Transfer</DialogTitle>
              <DialogDescription>
                Enter the blockchain transaction ID after sending tokens to the user's wallet.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-md mb-4">
                <AlertTriangle className="h-5 w-5 mb-2" />
                <p className="font-medium">Important</p>
                <p className="text-sm">
                  Please make sure you have actually sent the tokens to the user's wallet before 
                  confirming. This action cannot be undone.
                </p>
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Transaction ID</span>
                    <p className="font-mono text-sm">{selectedTransaction.transaction_id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date</span>
                    <p>{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">User</span>
                  <p>
                    {userData?.first_name} {userData?.last_name}
                    {userData?.email && ` (${userData.email})`}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium">Amount</span>
                    <p className="text-2xl font-bold">${selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium">Payment Method</span>
                    <p className="capitalize">{selectedTransaction.payment_method}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium">Wallet Address</span>
                      <p className="font-mono text-sm break-all">{selectedTransaction.wallet_address}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCopyAddress(selectedTransaction.wallet_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blockchain-tx">Blockchain Transaction ID</Label>
                  <Input
                    id="blockchain-tx"
                    placeholder="0x..."
                    value={blockchainTxId}
                    onChange={(e) => setBlockchainTxId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the transaction hash/ID from the blockchain transaction you used to send the tokens.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleConfirmSent}
                disabled={isProcessing || !blockchainTxId.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Tokens Sent
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PendingTransactions;
