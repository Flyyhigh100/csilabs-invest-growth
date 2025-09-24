import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, History, Download, Filter } from 'lucide-react';
import { LegacyAssetChangeHistory } from './LegacyAssetChangeHistory';
import { useLegacyAssetHistory } from '@/hooks/useLegacyAssetHistory';
import { LegacyAssetType } from '@/hooks/useLegacyAssets';

interface AdminChangeHistoryCardProps {
  targetUserId: string;
  userName?: string;
  assetType?: LegacyAssetType;
}

export const AdminChangeHistoryCard: React.FC<AdminChangeHistoryCardProps> = ({
  targetUserId,
  userName,
  assetType
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { history, isLoading } = useLegacyAssetHistory(targetUserId, assetType);

  const adminChanges = history.filter(entry => entry.is_admin_action);
  const userChanges = history.filter(entry => !entry.is_admin_action);
  const significantChanges = history.filter(entry => {
    if (entry.operation === 'legacy_asset_updated') {
      const oldAmount = parseFloat(entry.old_values?.amount || 0);
      const newAmount = parseFloat(entry.new_values?.amount || 0);
      return Math.abs(oldAmount - newAmount) > 100; // Significant if change > 100 shares
    }
    return true;
  });

  const exportHistory = () => {
    const csvData = history.map(entry => ({
      Date: entry.created_at,
      Operation: entry.operation,
      'Asset Type': entry.new_values?.asset_type || entry.old_values?.asset_type,
      'Old Amount': entry.old_values?.amount || '',
      'New Amount': entry.new_values?.amount || '',
      'Admin Action': entry.is_admin_action ? 'Yes' : 'No',
      Reason: entry.reason || '',
      'User Agent': entry.user_agent || ''
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy-asset-history-${userName || targetUserId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900">
                  Change History {userName && `- ${userName}`}
                </CardTitle>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              
              {!isOpen && !isLoading && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white border-orange-200 text-orange-800">
                    {history.length} total
                  </Badge>
                  {adminChanges.length > 0 && (
                    <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">
                      {adminChanges.length} admin
                    </Badge>
                  )}
                  {significantChanges.length > 0 && (
                    <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-800">
                      {significantChanges.length} significant
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{history.length}</div>
                <div className="text-xs text-muted-foreground">Total Changes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{adminChanges.length}</div>
                <div className="text-xs text-muted-foreground">Admin Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userChanges.length}</div>
                <div className="text-xs text-muted-foreground">User Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{significantChanges.length}</div>
                <div className="text-xs text-muted-foreground">Significant</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportHistory}
                  disabled={history.length === 0}
                  className="border-orange-200 text-orange-800 hover:bg-orange-100"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="border-orange-200 text-orange-800"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filter (Coming Soon)
                </Button>
              </div>
              
              {assetType && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Filtered: {assetType}
                </Badge>
              )}
            </div>

            {/* Change History */}
            <LegacyAssetChangeHistory 
              targetUserId={targetUserId}
              assetType={assetType}
              isCompact={true}
              maxHeight="500px"
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdminChangeHistoryCard;