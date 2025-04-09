
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { markTokensAsSent } from '@/utils/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PendingTransactions = () => {
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [blockchainTxId, setBlockchainTxId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('token_sent', false)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const openDialog = (tx: any) => {
    setSelectedTx(tx);
    setBlockchainTxId('');
    setIsDialogOpen(true);
  };

  const handleConfirmSent = async () => {
    if (!blockchainTxId.trim()) {
      toast.error('Please enter a blockchain transaction ID');
      return;
    }

    try {
      setIsSubmitting(true);
      await markTokensAsSent(selectedTx.id, blockchainTxId);
      setIsDialogOpen(false);
      refetch();
      toast.success('Transaction marked as sent');
    } catch (err) {
      console.error('Error marking transaction as sent:', err);
      toast.error('Failed to update transaction status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">Error loading transactions: {(error as Error).message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Token Distributions</CardTitle>
          <CardDescription>
            Send tokens to user wallets and mark transactions as completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium">No pending transactions</h3>
              <p className="mt-1 text-gray-500">
                All token distributions have been completed
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {tx.profiles?.first_name} {tx.profiles?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{tx.profiles?.email}</div>
                    </TableCell>
                    <TableCell>${tx.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs max-w-[150px] truncate">
                        {tx.wallet_address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Distribution
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm"
                        onClick={() => openDialog(tx)}
                      >
                        Mark as Sent
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Tokens as Sent</DialogTitle>
            <DialogDescription>
              Enter the blockchain transaction ID for verification purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wallet">Destination Wallet</Label>
              <Input 
                id="wallet" 
                value={selectedTx?.wallet_address || ''}
                readOnly
                className="font-mono text-sm bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                value={selectedTx ? `$${Number(selectedTx.amount).toFixed(2)}` : ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx_id">Blockchain Transaction ID</Label>
              <Input 
                id="tx_id" 
                placeholder="0x..."
                value={blockchainTxId}
                onChange={(e) => setBlockchainTxId(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSent} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingTransactions;
