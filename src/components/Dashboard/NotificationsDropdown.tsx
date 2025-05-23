
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Clock, DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    hasUnread, 
    isLoading, 
    isMarkingAllRead,
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tokens':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'kyc':
        return <Check className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };
  
  const handleItemClick = (notificationId: string, read: boolean) => {
    if (!read) {
      markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs" 
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Clock className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : notifications?.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications?.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-0 focus:bg-gray-100 ${notification.read ? 'opacity-75' : 'bg-blue-50'}`}
                  onSelect={(e) => e.preventDefault()}
                >
                  <button 
                    className="w-full text-left px-3 py-2"
                    onClick={() => handleItemClick(notification.id, notification.read)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <Badge className="mt-1 h-5 bg-blue-500">New</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
