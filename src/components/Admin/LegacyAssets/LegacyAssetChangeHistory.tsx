import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, Clock, User, Shield, AlertCircle, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { useLegacyAssetHistory } from '@/hooks/useLegacyAssetHistory';
import { format } from 'date-fns';
import { LegacyAssetType } from '@/hooks/useLegacyAssets';

interface LegacyAssetChangeHistoryProps {
  targetUserId: string;
  assetType?: LegacyAssetType;
  isCompact?: boolean;
  maxHeight?: string;
}

export const LegacyAssetChangeHistory: React.FC<LegacyAssetChangeHistoryProps> = ({
  targetUserId,
  assetType,
  isCompact = false,
  maxHeight = "400px"
}) => {
  const { 
    history, 
    isLoading, 
    error, 
    formatOperation, 
    getChangeDescription, 
    isSignificantChange 
  } = useLegacyAssetHistory(targetUserId, assetType);

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'legacy_asset_created': return <Plus className="h-3 w-3 text-green-600" />;
      case 'legacy_asset_updated': return <TrendingUp className="h-3 w-3 text-blue-600" />;
      case 'legacy_asset_deleted': return <Minus className="h-3 w-3 text-red-600" />;
      default: return <AlertCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'legacy_asset_created': return 'bg-green-100 text-green-800 border-green-200';
      case 'legacy_asset_updated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'legacy_asset_deleted': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={isCompact ? "border-0 shadow-none" : ""}>
        <CardHeader className={isCompact ? "pb-2" : ""}>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-muted"></div>
                <div className="h-3 bg-muted rounded flex-1"></div>
                <div className="h-3 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-destructive/20 ${isCompact ? "border-0 shadow-none" : ""}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to load change history
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={isCompact ? "border-0 shadow-none" : ""}>
        <CardHeader className={isCompact ? "pb-2" : ""}>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No changes recorded yet</p>
            <p className="text-xs mt-1">Changes will appear here automatically</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isCompact ? "border-0 shadow-none" : ""}>
      <CardHeader className={isCompact ? "pb-2" : ""}>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Change History
            <Badge variant="outline" className="text-xs">
              {history.length} {history.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>
          {assetType && (
            <Badge variant="secondary" className="text-xs">
              {assetType}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={isCompact ? "pt-0" : ""}>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Timeline connector */}
                {index < history.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-6 bg-border"></div>
                )}
                
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border flex items-center justify-center">
                    {getOperationIcon(entry.operation)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getOperationColor(entry.operation)}`}
                      >
                        {formatOperation(entry.operation)}
                      </Badge>
                      
                      {entry.is_admin_action && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                          <Shield className="h-2 w-2 mr-1" />
                          Admin
                        </Badge>
                      )}
                      
                      {isSignificantChange(entry) && (
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                          Significant
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground mb-1">
                      {getChangeDescription(entry)}
                    </p>
                    
                    {entry.reason && (
                      <p className="text-xs text-muted-foreground mb-1 italic">
                        Reason: {entry.reason}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      
                      {entry.user_agent && (
                        <div className="flex items-center gap-1" title={entry.user_agent}>
                          <User className="h-3 w-3" />
                          {entry.user_agent.includes('Chrome') ? 'Chrome' :
                           entry.user_agent.includes('Firefox') ? 'Firefox' :
                           entry.user_agent.includes('Safari') ? 'Safari' : 'Browser'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < history.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LegacyAssetChangeHistory;