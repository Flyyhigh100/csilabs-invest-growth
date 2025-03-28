
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/Admin/Layout';
import { toast } from 'sonner';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, CreditCard, Filter, ArrowUpDown, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  payment_method: string;
  status: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
  payment_address?: string;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [completingTransaction, setCompletingTransaction] = useState(false);
  const isMobile = useIsMobile();
  
  const form = useForm({
    defaultValues: {
      txHash: '',
      notes: '',
    }
  });

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch user data separately since we're having issues with the join
      const formattedData: Transaction[] = [];
      
      for (const transaction of data) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', transaction.user_id)
          .single();
          
        const { data: authUser } = await supabase.auth.admin.getUserById(
          transaction.user_id
        );
        
        formattedData.push({
          ...transaction,
          user: {
            email: authUser?.user?.email || '',
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || ''
          }
        });
      }
      
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      
      // If there was an error, let's try a simpler approach without joins
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (filter !== 'all' && data) {
          const filtered = data.filter(tx => tx.status === filter);
          setTransactions(filtered.map(tx => ({
            ...tx,
            user: {
              email: 'User info unavailable',
              first_name: '',
              last_name: ''
            }
          })));
        } else if (data) {
          setTransactions(data.map(tx => ({
            ...tx,
            user: {
              email: 'User info unavailable',
              first_name: '',
              last_name: ''
            }
          })));
        }
      } catch (fallbackError) {
        console.error('Fallback error fetching transactions:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (values: { txHash: string, notes: string }) => {
    if (!selectedTransaction) return;
    
    setCompletingTransaction(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTransaction.id);
      
      if (error) throw error;
      
      toast.success('Transaction marked as completed');
      setOpenDialog(false);
      setSelectedTransaction(null);
      form.reset();
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setCompletingTransaction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = [
      'Transaction ID',
      'Date',
      'Customer',
      'Email',
      'Amount',
      'Payment Method',
      'Wallet Address',
      'Status'
    ];

    const csvData = transactions.map(tx => [
      tx.transaction_id,
      new Date(tx.created_at).toLocaleString(),
      `${tx.user?.first_name || ''} ${tx.user?.last_name || ''}`.trim() || 'Unknown',
      tx.user?.email || 'Unknown',
      tx.amount,
      tx.payment_method,
      tx.wallet_address,
      tx.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CompleteTransactionContent = () => (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleMarkCompleted)} className="space-y-4">
          <FormField
            control={form.control}
            name="txHash"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Hash (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." {...field} />
                </FormControl>
                <FormDescription>
                  Blockchain transaction hash for your records
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distribution Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any notes about this token distribution"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <p className="font-medium">Transaction Information:</p>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div className="text-gray-500">Amount:</div>
              <div>${selectedTransaction?.amount}</div>
              <div className="text-gray-500">Payment Method:</div>
              <div className="capitalize">{selectedTransaction?.payment_method}</div>
              <div className="text-gray-500">Wallet Address:</div>
              <div className="truncate">{selectedTransaction?.wallet_address}</div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={completingTransaction}
            >
              {completingTransaction ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );

  return (
    <AdminLayout title="Transaction Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('pending')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </Button>
            <Button 
              variant={filter === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('completed')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
            </Button>
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Filter className="mr-2 h-4 w-4" />
              All
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={transactions.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Transactions Found</CardTitle>
              <CardDescription>
                {filter === 'pending' 
                  ? 'There are no pending transactions that require your attention.'
                  : filter === 'completed'
                    ? 'There are no completed transactions in the system.'
                    : 'There are no transactions in the system yet.'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {filter === 'pending' 
                  ? 'Pending Transactions'
                  : filter === 'completed'
                    ? 'Completed Transactions'
                    : 'All Transactions'}
              </CardTitle>
              <CardDescription>
                {filter === 'pending' 
                  ? 'Transactions that require token distribution'
                  : filter === 'completed'
                    ? 'Transactions with completed token distributions'
                    : 'All transaction records'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {transaction.user?.first_name
                            ? `${transaction.user.first_name} ${transaction.user.last_name || ''}`.trim()
                            : 'Anonymous User'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {transaction.user?.email || 'Unknown'}
                        </TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                            {transaction.payment_method}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.status === 'pending' ? (
                            isMobile ? (
                              <Drawer>
                                <DrawerTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedTransaction(transaction)}
                                  >
                                    Complete
                                  </Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                  <DrawerHeader>
                                    <DrawerTitle>Complete Transaction</DrawerTitle>
                                    <DrawerDescription>
                                      Mark this transaction as completed after distributing tokens
                                    </DrawerDescription>
                                  </DrawerHeader>
                                  <div className="px-4">
                                    <CompleteTransactionContent />
                                  </div>
                                  <DrawerFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setSelectedTransaction(null);
                                        form.reset();
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </DrawerFooter>
                                </DrawerContent>
                              </Drawer>
                            ) : (
                              <Dialog open={openDialog && selectedTransaction?.id === transaction.id} onOpenChange={(open) => {
                                setOpenDialog(open);
                                if (!open) {
                                  setSelectedTransaction(null);
                                  form.reset();
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setOpenDialog(true);
                                    }}
                                  >
                                    Complete
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Complete Transaction</DialogTitle>
                                    <DialogDescription>
                                      Mark this transaction as completed after distributing tokens
                                    </DialogDescription>
                                  </DialogHeader>
                                  <CompleteTransactionContent />
                                </DialogContent>
                              </Dialog>
                            )
                          ) : (
                            <Button variant="ghost" size="sm" disabled>
                              View
                            </Button>
                          )}
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

export default AdminTransactions;
