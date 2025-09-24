import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Info, Receipt, Plus, Edit2, Trash2, AlertTriangle, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LegacyAssetType } from '@/hooks/useLegacyAssets';
import { useLegacyAssetTransactions, TransactionType, LegacyAssetTransaction } from '@/hooks/useLegacyAssetTransactions';
import { format } from 'date-fns';
import { formatCurrency, formatTokenAmount } from '@/utils/format';

interface TransactionFormData {
  transactionType: TransactionType;
  transactionDate: string;
  sharesQuantity: string;
  pricePerShare: string;
  notes: string;
}

interface AssetTypeSectionProps {
  assetType: LegacyAssetType;
  displayValue: string;
  assetDescriptions: Record<LegacyAssetType, string>;
  handleValueChange: (assetType: LegacyAssetType, value: string) => void;
  expandedAssets: Record<string, boolean>;
  showAddForm: Record<string, boolean>;
  editingTransaction: Record<string, LegacyAssetTransaction | null>;
  formData: Record<string, TransactionFormData>;
  toggleAssetExpansion: (assetType: string) => void;
  toggleAddForm: (assetType: string) => void;
  resetForm: (assetType: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, TransactionFormData>>>;
  setEditingTransaction: React.Dispatch<React.SetStateAction<Record<string, LegacyAssetTransaction | null>>>;
}

const AssetTypeSection: React.FC<AssetTypeSectionProps> = ({
  assetType,
  displayValue,
  assetDescriptions,
  handleValueChange,
  expandedAssets,
  showAddForm,
  editingTransaction,
  formData,
  toggleAssetExpansion,
  toggleAddForm,
  resetForm,
  setFormData,
  setEditingTransaction
}) => {
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalShares,
    getAverageCostBasis
  } = useLegacyAssetTransactions(assetType);

  const hasValue = parseFloat(displayValue) > 0;
  const isExpanded = expandedAssets[assetType];
  const currentFormData = formData[assetType];
  const currentEditingTransaction = editingTransaction[assetType];
  
  const totalFromTransactions = getTotalShares(assetType);
  const manualTotal = parseFloat(displayValue) || 0;
  const hasDiscrepancy = Math.abs(totalFromTransactions - manualTotal) > 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFormData) return;

    const transactionData = {
      assetType,
      transactionType: currentFormData.transactionType,
      transactionDate: currentFormData.transactionDate,
      sharesQuantity: parseFloat(currentFormData.sharesQuantity),
      pricePerShare: parseFloat(currentFormData.pricePerShare),
      notes: currentFormData.notes || undefined
    };

    try {
      if (currentEditingTransaction) {
        await updateTransaction.mutateAsync({
          id: currentEditingTransaction.id,
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
      resetForm(assetType);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction: LegacyAssetTransaction) => {
    setEditingTransaction(prev => ({
      ...prev,
      [assetType]: transaction
    }));
    setFormData(prev => ({
      ...prev,
      [assetType]: {
        transactionType: transaction.transaction_type,
        transactionDate: transaction.transaction_date,
        sharesQuantity: transaction.shares_quantity.toString(),
        pricePerShare: transaction.price_per_share.toString(),
        notes: transaction.notes || ''
      }
    }));
    toggleAddForm(assetType);
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

  const syncFromTransactions = () => {
    handleValueChange(assetType, totalFromTransactions.toString());
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'sale': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'transfer_in': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'transfer_out': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
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
    <Card className={`${hasValue ? 'ring-1 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor={assetType} className="text-sm font-medium">
              {assetType}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{assetDescriptions[assetType]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {hasValue && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {transactions.length} transactions
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleAssetExpansion(assetType)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Input
            id={assetType}
            type="number"
            min="0"
            step="0.00000001"
            placeholder="0"
            value={displayValue}
            onChange={(e) => handleValueChange(assetType, e.target.value)}
            className={hasValue ? "border-primary/50 bg-primary/5" : ""}
          />
          
          {hasValue && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {parseFloat(displayValue).toLocaleString()} shares (manual)
              </span>
              {totalFromTransactions > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {formatTokenAmount(totalFromTransactions)} from transactions
                  </span>
                  {hasDiscrepancy && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="h-3 w-3 text-amber-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Discrepancy between manual total and transaction sum</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {hasValue && (
        <Collapsible open={isExpanded} onOpenChange={() => toggleAssetExpansion(assetType)}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Summary and Actions */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From Transactions:</span>
                    <div className="font-medium">{formatTokenAmount(totalFromTransactions)} shares</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Cost:</span>
                    <div className="font-medium">{formatCurrency(getAverageCostBasis(assetType))}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {hasDiscrepancy && totalFromTransactions > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={syncFromTransactions}
                      className="text-xs"
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAddForm(assetType)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Transaction
                  </Button>
                </div>
              </div>

              {/* Add/Edit Transaction Form */}
              {showAddForm[assetType] && currentFormData && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {currentEditingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={currentFormData.transactionType}
                            onValueChange={(value: TransactionType) =>
                              setFormData(prev => ({
                                ...prev,
                                [assetType]: { ...prev[assetType], transactionType: value }
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
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
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <Input
                            type="date"
                            value={currentFormData.transactionDate}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [assetType]: { ...prev[assetType], transactionDate: e.target.value }
                            }))}
                            className="h-8"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Shares</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Number of shares"
                            value={currentFormData.sharesQuantity}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [assetType]: { ...prev[assetType], sharesQuantity: e.target.value }
                            }))}
                            className="h-8"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Price/Share</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            placeholder="Price per share"
                            value={currentFormData.pricePerShare}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [assetType]: { ...prev[assetType], pricePerShare: e.target.value }
                            }))}
                            className="h-8"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Notes (Optional)</Label>
                        <Textarea
                          placeholder="Additional notes"
                          value={currentFormData.notes}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [assetType]: { ...prev[assetType], notes: e.target.value }
                          }))}
                          rows={2}
                          className="text-xs"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={addTransaction.isPending || updateTransaction.isPending}
                          className="flex-1 h-8 text-xs"
                        >
                          {currentEditingTransaction ? 'Update' : 'Add'} Transaction
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => resetForm(assetType)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Transaction History */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="h-3 w-3" />
                  Transaction History
                  {transactions.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {transactions.length}
                    </Badge>
                  )}
                </h4>
                
                {isLoading ? (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    Loading transactions...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No transactions recorded yet</p>
                    <p className="text-xs opacity-75">Add your first transaction above</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {transactions
                      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                      .map((transaction, index) => {
                        const isPositive = transaction.transaction_type === 'purchase' || transaction.transaction_type === 'transfer_in';
                        return (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-2 rounded border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                                {formatTransactionType(transaction.transaction_type)}
                              </Badge>
                              
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium">
                                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                                  </span>
                                  <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : '-'}{formatTokenAmount(Math.abs(transaction.shares_quantity))}
                                  </span>
                                  <span className="text-muted-foreground">
                                    @ {formatCurrency(transaction.price_per_share)}
                                  </span>
                                </div>
                                {transaction.notes && (
                                  <p className="text-xs text-muted-foreground truncate mt-1">
                                    {transaction.notes}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-xs font-medium text-right">
                                {formatCurrency(transaction.total_value || (transaction.shares_quantity * transaction.price_per_share))}
                              </div>
                            </div>
                            
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(transaction)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(transaction.id)}
                                disabled={deleteTransaction.isPending}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};

export default AssetTypeSection;