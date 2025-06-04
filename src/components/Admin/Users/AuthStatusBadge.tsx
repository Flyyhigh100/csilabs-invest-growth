
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AuthStatusBadgeProps {
  emailConfirmed: boolean;
  emailConfirmedAt?: string | null;
  authMethod?: string;
  signupMethod?: string;
  lastSignInAt?: string | null;
}

const AuthStatusBadge: React.FC<AuthStatusBadgeProps> = ({
  emailConfirmed,
  emailConfirmedAt,
  authMethod,
  signupMethod,
  lastSignInAt
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getAuthMethodIcon = (method?: string) => {
    if (method === 'Email/Password') {
      return <Shield className="h-3 w-3" />;
    }
    return <Clock className="h-3 w-3" />;
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Email Confirmation Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={emailConfirmed ? "default" : "destructive"}
              className={`flex items-center gap-1 text-xs ${
                emailConfirmed 
                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }`}
            >
              {emailConfirmed ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {emailConfirmed ? 'Email Confirmed' : 'Email Pending'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="w-64">
            <div className="text-xs">
              <div className="font-semibold">Email Status:</div>
              <div>Status: {emailConfirmed ? 'Confirmed' : 'Pending Confirmation'}</div>
              {emailConfirmedAt && (
                <div>Confirmed: {formatDate(emailConfirmedAt)}</div>
              )}
              {!emailConfirmed && (
                <div className="text-amber-600 mt-1">
                  User may need to check email or request new confirmation
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Authentication Method */}
      {authMethod && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 text-xs bg-blue-50 text-blue-800 border-blue-200"
              >
                {getAuthMethodIcon(authMethod)}
                {authMethod}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="w-64">
              <div className="text-xs">
                <div className="font-semibold">Authentication Details:</div>
                <div>Current Method: {authMethod}</div>
                <div>Signup Method: {signupMethod || 'Unknown'}</div>
                {lastSignInAt && (
                  <div>Last Login: {formatDate(lastSignInAt)}</div>
                )}
                {authMethod === 'Magic Link' && (
                  <div className="text-amber-600 mt-1">
                    User signs in via email links (no password)
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default AuthStatusBadge;
