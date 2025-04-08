
import React from 'react';
import {
  Bell,
  BellRing,
  Check,
  Wallet,
  CreditCard,
  UserCheck,
  Coins,
  CircleAlert
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationsMenu: React.FC = () => {
  const { 
    notifications, 
    hasUnread, 
    isLoading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Get the appropriate icon based on notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'wallet':
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'kyc':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      case 'tokens':
        return <Coins className="h-4 w-4 text-amber-500" />;
      default:
        return <CircleAlert className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format the time of the notification
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasUnread ? (
            <>
              <BellRing className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between pb-2">
          <h4 className="font-medium text-sm">Notifications</h4>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator className="my-2" />
        
        {isLoading ? (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cbis-blue mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center">
            <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 py-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium">{notification.title}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs py-0 px-2"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
