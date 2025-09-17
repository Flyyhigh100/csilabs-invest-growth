import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLegacyAssets, LEGACY_ASSET_TYPES, LegacyAssetType } from '@/hooks/useLegacyAssets';
import { useDebounce } from '@/hooks/useDebounce';

const LegacyAssetsCard = () => {
  const { legacyAssets, isLoading, updateAsset, getAssetAmount, getTotalAssetCount } = useLegacyAssets();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});

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
              Track your Cannabis Science legacy holdings and assets
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

            <div className="grid gap-4 md:grid-cols-2">
              {LEGACY_ASSET_TYPES.map((assetType) => {
                const displayValue = getDisplayValue(assetType);
                const hasValue = parseFloat(displayValue) > 0;

                return (
                  <div key={assetType} className="space-y-2">
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
                      <div className="text-xs text-muted-foreground">
                        {parseFloat(displayValue).toLocaleString()} shares
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasAssets && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total Holdings:</span>
                  <span className="text-primary font-semibold">
                    {totalAssets.toLocaleString()} shares
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">💡 Auto-save enabled</p>
              <p>Your changes are automatically saved as you type. All amounts are stored securely and visible only to you.</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LegacyAssetsCard;