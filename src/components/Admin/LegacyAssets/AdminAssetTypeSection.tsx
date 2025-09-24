import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Info, Plus, Edit2, Trash2, AlertTriangle, Calculator, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LegacyAssetType } from '@/hooks/useLegacyAssets';
import { useAdminLegacyAssetTransactions, AdminTransactionType, AdminLegacyAssetTransaction } from '@/hooks/useAdminLegacyAssetTransactions';
import { format } from 'date-fns';
import { formatCurrency, formatCurrencyPrecise, formatTokenAmount } from '@/utils/format';
import AdminAssetUpdateDialog from './AdminAssetUpdateDialog';

interface TransactionFormData {
  transactionType: AdminTransactionType;
  transactionDate: string;
  sharesQuantity: string;
  pricePerShare: string;
  notes: string;
}

interface AdminAssetTypeSectionProps {
  assetType: LegacyAssetType;
  targetUserId: string;
  targetUserName?: string;
  displayValue: string;
  assetDescriptions: Record<LegacyAssetType, string>;
  handleValueChange: (assetType: LegacyAssetType, value: string, reason?: string) => void;
  expandedAssets: Record<string, boolean>;
  showAddForm: Record<string, boolean>;
  editingTransaction: Record<string, AdminLegacyAssetTransaction | null>;
  formData: Record<string, TransactionFormData>;
  toggleAssetExpansion: (assetType: string) => void;
  toggleAddForm: (assetType: string) => void;
  resetForm: (assetType: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, TransactionFormData>>>;
  setEditingTransaction: React.Dispatch<React.SetStateAction<Record<string, AdminLegacyAssetTransaction | null>>>;
  isAdminMode?: boolean;
}

export const AdminAssetTypeSection: React.FC<AdminAssetTypeSectionProps> = ({
  assetType,
  targetUserId,
  targetUserName,
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
  setEditingTransaction,
  isAdminMode = false
}) => {
  const [showUpdateDialog, setShowUpdateDialog] = React.useState(false);
  const [suggestedAmount, setSuggestedAmount] = React.useState<number | undefined>();
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalShares,
    getAverageCostBasis
  } = useAdminLegacyAssetTransactions(targetUserId, assetType);

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
      userId: targetUserId,
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

  const handleEdit = (transaction: AdminLegacyAssetTransaction) => {
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
    if (isAdminMode) {
      setSuggestedAmount(totalFromTransactions);
      setShowUpdateDialog(true);
    } else {
      handleValueChange(assetType, totalFromTransactions.toString());
    }
  };

  const handleAdminUpdate = (amount: number, reason: string) => {
    handleValueChange(assetType, amount.toString(), reason);
    setShowUpdateDialog(false);
    setSuggestedAmount(undefined);
  };

  const getTransactionTypeColor = (type: AdminTransactionType) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'sale': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'transfer_in': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'transfer_out': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatTransactionType = (type: AdminTransactionType) => {
    switch (type) {
      case 'purchase': return 'Purchase';
      case 'sale': return 'Sale';
      case 'transfer_in': return 'Transfer In';
      case 'transfer_out': return 'Transfer Out';
      default: return type;
    }
  };

  return (
    <Card className={`${hasValue ? 'ring-1 ring-primary/20' : ''} ${isAdminMode ? 'border-orange-200 bg-orange-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdminMode && (
              <Shield className="h-4 w-4 text-orange-600" />
            )}
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
            {isAdminMode && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                Admin Mode
              </Badge>
            )}
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
          <div className="relative">
            <Input
              id={assetType}
              type="number"
              min="0"
              step="0.00000001"
              placeholder="0"
              value={displayValue}
              onChange={(e) => {
                if (isAdminMode) {
                  // For admin mode, show dialog for significant changes
                  const newValue = parseFloat(e.target.value) || 0;
                  const currentValue = parseFloat(displayValue) || 0;
                  if (Math.abs(newValue - currentValue) > 10) {
                    setShowUpdateDialog(true);
                  } else {
                    handleValueChange(assetType, e.target.value, 'Minor admin adjustment');
                  }
                } else {
                  handleValueChange(assetType, e.target.value);
                }
              }}
              className={`${hasValue ? "border-primary/50 bg-primary/5" : ""} ${isAdminMode ? "border-orange-300 bg-orange-50" : ""}`}
            />
            {isAdminMode && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Shield className="h-3 w-3 text-orange-600" />
              </div>
            )}
          </div>
          
          {/* Prominent Add Transaction CTA for empty assets */}
          {!hasValue && transactions.length === 0 && (
            <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">📝 Add transaction here</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">Track purchase history and cost basis</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => toggleAddForm(assetType)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Start
                </Button>
              </div>
            </div>
          )}
          
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

      {/* Add/Edit Transaction Form - Available for both empty and populated assets */}
      {showAddForm[assetType] && currentFormData && (
        <div className="px-6 pb-4">
          <Card className={isAdminMode ? 'border-orange-200 bg-orange-50/20' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {isAdminMode && <Shield className="h-4 w-4 text-orange-600" />}
                {currentEditingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                {isAdminMode && (
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                    Admin Action
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={currentFormData.transactionType}
                      onValueChange={(value: AdminTransactionType) =>
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
                      placeholder="0.000"
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
                    className={`flex-1 h-8 text-xs ${isAdminMode ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
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
        </div>
      )}

      {hasValue && (
        <Collapsible open={isExpanded} onOpenChange={() => toggleAssetExpansion(assetType)}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Summary and Actions */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${isAdminMode ? 'bg-orange-100/50 dark:bg-orange-900/20' : 'bg-muted/30'}`}>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From Transactions:</span>
                    <div className="font-medium">{formatTokenAmount(totalFromTransactions)} shares</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Cost:</span>
                    <div className="font-medium">{formatCurrencyPrecise(getAverageCostBasis(assetType))}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Value:</span>
                    <div className="font-medium text-green-700 dark:text-green-400">
                      {formatCurrency(totalFromTransactions * getAverageCostBasis(assetType))}
                    </div>
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
                    className={`text-xs ${isAdminMode ? 'border-orange-300 hover:bg-orange-50' : ''}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Transaction
                  </Button>
                </div>
              </div>

              {/* Transaction History */}
              {transactions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Transaction History
                      {isAdminMode && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                          Admin View
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className={`p-3 rounded-lg border ${isAdminMode ? 'border-orange-200 bg-orange-50/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                                {formatTransactionType(transaction.transaction_type)}
                              </Badge>
                              <div className="text-sm">
                                <span className="font-medium">
                                  {formatTokenAmount(transaction.shares_quantity)} shares
                                </span>
                                <span className="text-muted-foreground"> @ </span>
                                 <span className="font-medium">
                                   {formatCurrencyPrecise(transaction.price_per_share)}
                                 </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatCurrency(transaction.total_value)}
                              </span>
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
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {transaction.notes && (
                            <p className="text-xs text-muted-foreground mt-2 pl-2 border-l-2 border-gray-200">
                              {transaction.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
      {/* Admin Update Dialog */}
      {isAdminMode && (
        <AdminAssetUpdateDialog
          isOpen={showUpdateDialog}
          onClose={() => {
            setShowUpdateDialog(false);
            setSuggestedAmount(undefined);
          }}
          onConfirm={handleAdminUpdate}
          assetType={assetType}
          currentAmount={parseFloat(displayValue) || 0}
          suggestedAmount={suggestedAmount}
          userName={targetUserName || `User ${targetUserId.slice(0, 8)}`}
        />
      )}
    </Card>
  );
};