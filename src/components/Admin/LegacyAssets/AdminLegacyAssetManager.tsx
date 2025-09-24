import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, TrendingUp } from 'lucide-react';
import { LEGACY_ASSET_TYPES, LegacyAssetType } from '@/hooks/useLegacyAssets';
import { useAdminLegacyAssets } from '@/hooks/useAdminLegacyAssets';
import { AdminAssetTypeSection } from './AdminAssetTypeSection';
import { formatCurrency, formatTokenAmount } from '@/utils/format';

interface AdminLegacyAssetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TransactionFormData {
  transactionType: 'purchase' | 'sale' | 'transfer_in' | 'transfer_out';
  transactionDate: string;
  sharesQuantity: string;
  pricePerShare: string;
  notes: string;
}

const AdminLegacyAssetManager: React.FC<AdminLegacyAssetManagerProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { 
    legacyAssets, 
    isLoading, 
    updateAsset, 
    deleteAsset,
    getTotalAssetCount 
  } = useAdminLegacyAssets(user.user_id);

  const [inputValues, setInputValues] = useState<Record<LegacyAssetType, string>>({} as Record<LegacyAssetType, string>);
  const [expandedAssets, setExpandedAssets] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState<Record<string, boolean>>({});
  const [editingTransaction, setEditingTransaction] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<Record<string, TransactionFormData>>({});

  // Initialize form data for each asset type
  React.useEffect(() => {
    const initialFormData: Record<string, TransactionFormData> = {};
    LEGACY_ASSET_TYPES.forEach(assetType => {
      initialFormData[assetType] = {
        transactionType: 'purchase',
        transactionDate: new Date().toISOString().split('T')[0],
        sharesQuantity: '',
        pricePerShare: '',
        notes: ''
      };
    });
    setFormData(initialFormData);

    // Initialize input values from existing assets
    const initialInputValues: Record<LegacyAssetType, string> = {} as Record<LegacyAssetType, string>;
    LEGACY_ASSET_TYPES.forEach(assetType => {
      const asset = legacyAssets.find(a => a.asset_type === assetType);
      initialInputValues[assetType] = asset?.amount.toString() || '';
    });
    setInputValues(initialInputValues);
  }, [legacyAssets]);

  const handleValueChange = async (assetType: LegacyAssetType, value: string) => {
    setInputValues(prev => ({ ...prev, [assetType]: value }));
    
    // Auto-save after user stops typing (debounced in parent component would be better)
    const numericValue = parseFloat(value) || 0;
    if (numericValue >= 0) {
      try {
        if (numericValue === 0) {
          await deleteAsset.mutateAsync({ userId: user.user_id, assetType });
        } else {
          await updateAsset.mutateAsync({ userId: user.user_id, assetType, amount: numericValue });
        }
      } catch (error) {
        console.error('Error updating asset:', error);
      }
    }
  };

  const toggleAssetExpansion = (assetType: string) => {
    setExpandedAssets(prev => ({ ...prev, [assetType]: !prev[assetType] }));
  };

  const toggleAddForm = (assetType: string) => {
    setShowAddForm(prev => ({ ...prev, [assetType]: !prev[assetType] }));
  };

  const resetForm = (assetType: string) => {
    setShowAddForm(prev => ({ ...prev, [assetType]: false }));
    setEditingTransaction(prev => ({ ...prev, [assetType]: null }));
    setFormData(prev => ({
      ...prev,
      [assetType]: {
        transactionType: 'purchase',
        transactionDate: new Date().toISOString().split('T')[0],
        sharesQuantity: '',
        pricePerShare: '',
        notes: ''
      }
    }));
  };

  const assetDescriptions: Record<LegacyAssetType, string> = {
    'CBIS Original Shares': 'Original CBIS shares from the initial investment rounds',
    'CBIS-GIFT Shares': 'CBIS shares received as gifts or promotional allocations',
    'CBIS-First Rights Shares (ENDO)': 'First rights shares related to ENDO partnerships',
    'CSi-VIP Shares': 'VIP tier shares with enhanced benefits and privileges',
    'CSi-VIP Award Shares': 'Award shares granted for achievements or milestones',
    'CSi-Management/Partner Shares': 'Shares allocated to management and partner participants'
  };

  const totalAssets = getTotalAssetCount();
  const hasAssets = totalAssets > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Legacy Assets Management: {user.first_name} {user.last_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Card */}
          {hasAssets && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Total Legacy Shares</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {formatTokenAmount(totalAssets)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {legacyAssets.filter(a => a.amount > 0).length} asset types
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="assets" className="space-y-4">
            <TabsList>
              <TabsTrigger value="assets">Asset Management</TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading legacy assets...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {LEGACY_ASSET_TYPES.map((assetType) => (
                    <AdminAssetTypeSection
                      key={assetType}
                      assetType={assetType}
                      targetUserId={user.user_id}
                      displayValue={inputValues[assetType] || ''}
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
                      isAdminMode={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLegacyAssetManager;