import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RealtimeStatusProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts?: number;
  lastError?: string | null;
  reconnectAttempts?: number;
  onManualReconnect?: () => void;
  className?: string;
}

export const RealtimeStatusIndicator: React.FC<RealtimeStatusProps> = ({
  isConnected,
  lastUpdate,
  connectionAttempts = 0,
  lastError = null,
  reconnectAttempts = 0,
  onManualReconnect,
  className = ""
}) => {
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="h-3 w-3" />,
        text: 'Live',
        variant: 'default' as const,
        className: 'bg-success text-success-foreground border-success',
        description: 'Real-time connection active'
      };
    } else if (reconnectAttempts > 0) {
      return {
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
        text: `Reconnecting (${reconnectAttempts})`,
        variant: 'secondary' as const,
        className: 'bg-warning text-warning-foreground border-warning',
        description: lastError || 'Attempting to reconnect...'
      };
    } else if (lastError) {
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        text: 'Error',
        variant: 'destructive' as const,
        className: 'bg-destructive text-destructive-foreground border-destructive',
        description: lastError
      };
    } else {
      return {
        icon: <WifiOff className="h-3 w-3" />,
        text: 'Offline',
        variant: 'destructive' as const,
        className: 'bg-destructive text-destructive-foreground border-destructive',
        description: 'No real-time connection'
      };
    }
  };

  const status = getStatusInfo();
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={status.variant}
        className={`flex items-center gap-1 ${status.className}`}
        title={status.description}
      >
        {status.icon}
        {status.text}
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </span>
      )}
      {!isConnected && onManualReconnect && (
        <Button
          variant="outline"
          size="sm"
          onClick={onManualReconnect}
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
      {lastError && (
        <span className="text-xs text-muted-foreground" title={lastError}>
          {lastError.length > 30 ? `${lastError.substring(0, 30)}...` : lastError}
        </span>
      )}
    </div>
  );
};