
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LastLoginDisplayProps {
  lastSignInAt?: string | null;
  createdAt?: string;
}

const LastLoginDisplay: React.FC<LastLoginDisplayProps> = ({
  lastSignInAt,
  createdAt
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLoginStatus = () => {
    if (!lastSignInAt) {
      return {
        status: 'never-logged-in',
        display: 'Never Logged In',
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-3 w-3" />
      };
    }

    const lastLogin = new Date(lastSignInAt);
    const now = new Date();
    const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLogin > 30) {
      return {
        status: 'inactive',
        display: formatDate(lastSignInAt),
        variant: 'destructive' as const,
        icon: <Clock className="h-3 w-3" />
      };
    } else if (daysSinceLogin > 7) {
      return {
        status: 'occasional',
        display: formatDate(lastSignInAt),
        variant: 'secondary' as const,
        icon: <Clock className="h-3 w-3" />
      };
    } else {
      return {
        status: 'active',
        display: formatDate(lastSignInAt),
        variant: 'default' as const,
        icon: <Clock className="h-3 w-3" />
      };
    }
  };

  const loginInfo = getLoginStatus();

  const getTooltipContent = () => {
    const accountAge = createdAt ? 
      Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 
      null;

    return (
      <div className="text-xs">
        <div className="font-semibold">Login Activity:</div>
        {lastSignInAt ? (
          <>
            <div>Last Login: {new Date(lastSignInAt).toLocaleString()}</div>
            <div>Status: {loginInfo.status === 'active' ? 'Active User' : 
                          loginInfo.status === 'occasional' ? 'Occasional User' : 'Inactive User'}</div>
          </>
        ) : (
          <div>User has never logged in since registration</div>
        )}
        {accountAge && (
          <div>Account Age: {accountAge} days</div>
        )}
        {createdAt && (
          <div>Registered: {new Date(createdAt).toLocaleDateString()}</div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={loginInfo.variant}
            className={`flex items-center gap-1 text-xs ${
              loginInfo.status === 'never-logged-in' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
              loginInfo.status === 'inactive' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
              loginInfo.status === 'occasional' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
              'bg-green-100 text-green-800 hover:bg-green-100'
            }`}
          >
            {loginInfo.icon}
            {loginInfo.display}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-64">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LastLoginDisplay;
