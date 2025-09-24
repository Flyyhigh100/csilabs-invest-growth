import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, TrendingUp, Info, Receipt, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLegacyAssets, LEGACY_ASSET_TYPES, LegacyAssetType } from '@/hooks/useLegacyAssets';
import { useLegacyAssetTransactions, TransactionType, LegacyAssetTransaction } from '@/hooks/useLegacyAssetTransactions';
import { useLegacyAssetHistory } from '@/hooks/useLegacyAssetHistory';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { formatCurrency, formatTokenAmount } from '@/utils/format';
import AssetTypeSection from './AssetTypeSection';

interface TransactionFormData {
  transactionType: TransactionType;
  transactionDate: string;
  sharesQuantity: string;
  pricePerShare: string;
  notes: string;
}

const LegacyAssetsCard = () => {
  const { legacyAssets, isLoading, updateAsset, getAssetAmount, getTotalAssetCount } = useLegacyAssets();
  const { history } = useLegacyAssetHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});
  const [expandedAssets, setExpandedAssets] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState<Record<string, boolean>>({});
  const [editingTransaction, setEditingTransaction] = useState<Record<string, LegacyAssetTransaction | null>>({});
  const [formData, setFormData] = useState<Record<string, TransactionFormData>>({});

  // Debounce the save operation
  const debouncedSave = useDebounce((assetType: LegacyAssetType, amount: number) => {
    updateAsset.mutate({ assetType, amount });
  }, 1000);

  const handleValueChange = useCallback((assetType: LegacyAssetType, value: string) => {
    setPendingValues(prev => ({ ...prev, [assetType]: value }));
    
    const numericValue = parseFloat(value) || 0;
    if (numericValue >= 0) {
      debouncedSave(assetType, numericValue);
    }
  }, [debouncedSave]);

  const getDisplayValue = (assetType: LegacyAssetType): string => {
    if (pendingValues[assetType] !== undefined) {
      return pendingValues[assetType];
    }
    const amount = getAssetAmount(assetType);
    return amount > 0 ? amount.toString() : '';
  };

  const getDefaultFormData = (): TransactionFormData => ({
    transactionType: 'purchase',
    transactionDate: new Date().toISOString().split('T')[0],
    sharesQuantity: '',
    pricePerShare: '',
    notes: ''
  });

  const toggleAssetExpansion = (assetType: string) => {
    setExpandedAssets(prev => ({
      ...prev,
      [assetType]: !prev[assetType]
    }));
  };

  const toggleAddForm = (assetType: string) => {
    setShowAddForm(prev => ({
      ...prev,
      [assetType]: !prev[assetType]
    }));
    if (!formData[assetType]) {
      setFormData(prev => ({
        ...prev,
        [assetType]: getDefaultFormData()
      }));
    }
  };

  const resetForm = (assetType: string) => {
    setFormData(prev => ({
      ...prev,
      [assetType]: getDefaultFormData()
    }));
    setEditingTransaction(prev => ({
      ...prev,
      [assetType]: null
    }));
    setShowAddForm(prev => ({
      ...prev,
      [assetType]: false
    }));
  };

  const totalAssets = getTotalAssetCount();
  const hasAssets = totalAssets > 0;

  const assetDescriptions: Record<LegacyAssetType, string> = {
    'CBIS Original Shares': 'Original Cannabis Science Inc. shares from before the company restructuring',
    'CBIS-GIFT Shares': 'Cannabis Science shares received as gifts or bonus allocations',
    'CBIS-First Rights Shares (ENDO)': 'First rights shares related to ENDO pharmaceutical partnerships',
    'CSi-VIP Shares': 'VIP tier shares with enhanced benefits and privileges',
    'CSi-VIP Award Shares': 'Award shares granted for special achievements or contributions',
    'CSi-Management/Partner Shares': 'Management or partnership shares with governance rights'
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Legacy Assets
          </CardTitle>
          <CardDescription>Loading your Cannabis Science legacy holdings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Legacy Assets</CardTitle>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              {hasAssets && !isOpen && (
                <div className="text-sm text-muted-foreground">
                  {totalAssets.toLocaleString()} total holdings
                </div>
              )}
            </div>
            <CardDescription>
              Track your Cannabis Science legacy holdings and transaction history
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!hasAssets && Object.keys(pendingValues).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No legacy assets recorded yet.</p>
                <p className="text-xs mt-1">Enter your holdings below to get started.</p>
              </div>
            )}

            <div className="space-y-6">
              {LEGACY_ASSET_TYPES.map((assetType) => (
                <AssetTypeSection 
                  key={assetType} 
                  assetType={assetType}
                  displayValue={getDisplayValue(assetType)}
                  assetDescriptions={assetDescriptions}
                  handleValueChange={handleValueChange}
                  expandedAssets={expandedAssets}
                  showAddForm={showAddForm}
                  editingTransaction={editingTransaction}
                  formData={formData}
                  toggleAssetExpansion={toggleAssetExpansion}
                  toggleAddForm={toggleAddForm}
                  resetForm={resetForm}
                  setFormData={setFormData}
                  setEditingTransaction={setEditingTransaction}
                />
              ))}
            </div>

            {hasAssets && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-md border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Total Legacy Assets:</span>
                  <span className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    {totalAssets.toLocaleString(undefined, { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 2 
                    })} shares
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">💡 Auto-save enabled</p>
              <p>Your changes are automatically saved as you type. Click on any asset with holdings to manage detailed transaction records.</p>
              {history.length > 0 && (
                <p className="mt-2 text-amber-600">
                  📋 {history.length} changes tracked - all modifications are automatically logged for your records
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LegacyAssetsCard;