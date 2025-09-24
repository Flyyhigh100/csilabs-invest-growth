import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useCommunicationStats } from '@/hooks/communication/useCommunicationStats';
import { useCommunicationRealtime } from '@/hooks/communication/useCommunicationRealtime';

interface CommunicationNotificationBadgeProps {
  className?: string;
}

const CommunicationNotificationBadge: React.FC<CommunicationNotificationBadgeProps> = ({ 
  className 
}) => {
  const { data: stats } = useCommunicationStats();
  
  // Set up real-time updates
  useCommunicationRealtime();

  if (!stats?.unreadConversations || stats.unreadConversations === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className={`ml-2 ${className}`}
    >
      <Bell className="h-3 w-3 mr-1" />
      {stats.unreadConversations}
    </Badge>
  );
};

export default CommunicationNotificationBadge;