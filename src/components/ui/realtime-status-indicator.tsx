import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RealtimeStatusProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts?: number;
  className?: string;
}

export const RealtimeStatusIndicator: React.FC<RealtimeStatusProps> = ({
  isConnected,
  lastUpdate,
  connectionAttempts = 0,
  className = ""
}) => {
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="h-3 w-3" />,
        text: 'Live',
        variant: 'default' as const,
        className: 'bg-success text-success-foreground border-success'
      };
    } else if (connectionAttempts > 0) {
      return {
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
        text: 'Reconnecting',
        variant: 'secondary' as const,
        className: 'bg-warning text-warning-foreground border-warning'
      };
    } else {
      return {
        icon: <WifiOff className="h-3 w-3" />,
        text: 'Offline',
        variant: 'destructive' as const,
        className: 'bg-destructive text-destructive-foreground border-destructive'
      };
    }
  };

  const status = getStatusInfo();
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={status.variant}
        className={`flex items-center gap-1 ${status.className}`}
      >
        {status.icon}
        {status.text}
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </span>
      )}
    </div>
  );
};