
import React, { useState } from 'react';
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
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Copy, Loader2, CreditCard, DollarSign, Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { markTokensAsSent } from '@/utils/adminUtils';

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
  
  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: fetchPendingTransactions,
  });
  
  const handleConfirmClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
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
    
    setIsProcessing(true);
    const success = await markTokensAsSent(selectedTransaction.id);
    setIsProcessing(false);
    
    if (success) {
      setConfirmDialogOpen(false);
      refetch();
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cbis-blue" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading transactions</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Transactions</h3>
          <p className="text-gray-500">
            All successful transactions have been processed. There are no pending token transfers.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Pending Token Transfers</h3>
        <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Transactions Requiring Token Transfer</CardTitle>
          <CardDescription>
            These users have made successful payments but haven't received their tokens yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
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
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleConfirmClick(transaction)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Sent
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Confirm Token Sent Dialog */}
      {selectedTransaction && (
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Token Transfer</DialogTitle>
              <DialogDescription>
                Mark this transaction as completed after sending tokens to the user's wallet.
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
                disabled={isProcessing}
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
