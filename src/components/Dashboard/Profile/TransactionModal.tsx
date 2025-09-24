import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLegacyAssetTransactions, TransactionType, LegacyAssetTransaction } from '@/hooks/useLegacyAssetTransactions';

interface TransactionModalProps {
  assetType: string;
  children: React.ReactNode;
}

interface TransactionFormData {
  transactionType: TransactionType;
  transactionDate: string;
  sharesQuantity: string;
  pricePerShare: string;
  notes: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ assetType, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<LegacyAssetTransaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    transactionType: 'purchase',
    transactionDate: new Date().toISOString().split('T')[0],
    sharesQuantity: '',
    pricePerShare: '',
    notes: ''
  });

  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalShares,
    getAverageCostBasis
  } = useLegacyAssetTransactions(assetType);

  const resetForm = () => {
    setFormData({
      transactionType: 'purchase',
      transactionDate: new Date().toISOString().split('T')[0],
      sharesQuantity: '',
      pricePerShare: '',
      notes: ''
    });
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      assetType,
      transactionType: formData.transactionType,
      transactionDate: formData.transactionDate,
      sharesQuantity: parseFloat(formData.sharesQuantity),
      pricePerShare: parseFloat(formData.pricePerShare),
      notes: formData.notes || undefined
    };

    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          updates: {
            transaction_type: transactionData.transactionType,
            transaction_date: transactionData.transactionDate,
            shares_quantity: transactionData.sharesQuantity,
            price_per_share: transactionData.pricePerShare,
            notes: transactionData.notes
          }
        });
      } else {
        await addTransaction.mutateAsync(transactionData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction: LegacyAssetTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transactionType: transaction.transaction_type,
      transactionDate: transaction.transaction_date,
      sharesQuantity: transaction.shares_quantity.toString(),
      pricePerShare: transaction.price_per_share.toString(),
      notes: transaction.notes || ''
    });
  };

  const handleDelete = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction.mutateAsync(transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const totalShares = getTotalShares(assetType);
  const averageCostBasis = getAverageCostBasis(assetType);

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'sale': return 'bg-red-100 text-red-800';
      case 'transfer_in': return 'bg-blue-100 text-blue-800';
      case 'transfer_out': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTransactionType = (type: TransactionType) => {
    switch (type) {
      case 'purchase': return 'Purchase';
      case 'sale': return 'Sale';
      case 'transfer_in': return 'Transfer In';
      case 'transfer_out': return 'Transfer Out';
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {assetType} - Transaction History
          </DialogTitle>
          <DialogDescription>
            Manage detailed transaction records for your {assetType} holdings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Cost Basis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${averageCostBasis.toFixed(4)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-type">Transaction Type</Label>
                    <Select
                      value={formData.transactionType}
                      onValueChange={(value: TransactionType) =>
                        setFormData(prev => ({ ...prev, transactionType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="transfer_in">Transfer In</SelectItem>
                        <SelectItem value="transfer_out">Transfer Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction-date">Date</Label>
                    <Input
                      id="transaction-date"
                      type="date"
                      value={formData.transactionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shares-quantity">Shares</Label>
                    <Input
                      id="shares-quantity"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Number of shares"
                      value={formData.sharesQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, sharesQuantity: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price-per-share">Price per Share</Label>
                    <Input
                      id="price-per-share"
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder="Price per share"
                      value={formData.pricePerShare}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerShare: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this transaction"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={addTransaction.isPending || updateTransaction.isPending}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {editingTransaction ? 'Update' : 'Add'} Transaction
                    </Button>
                    {editingTransaction && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions recorded yet. Add your first transaction to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Shares</TableHead>
                          <TableHead>Price/Share</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                                {formatTransactionType(transaction.transaction_type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.shares_quantity.toLocaleString()}</TableCell>
                            <TableCell>${transaction.price_per_share.toFixed(4)}</TableCell>
                            <TableCell>${transaction.total_value.toLocaleString()}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {transaction.notes || '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(transaction)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(transaction.id)}
                                  disabled={deleteTransaction.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;