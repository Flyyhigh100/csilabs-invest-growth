
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface TimeRemainingAlertProps {
  expiresAt: string;
}

const TimeRemainingAlert: React.FC<TimeRemainingAlertProps> = ({ expiresAt }) => {
  const formatTimeRemaining = (expiresAtStr: string): string => {
    const expiresAtDate = new Date(expiresAtStr);
    const now = new Date();
    
    const diffMs = expiresAtDate.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    }
    
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  };

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <Clock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Time Remaining</AlertTitle>
      <AlertDescription className="text-amber-700">
        This payment request will expire in {formatTimeRemaining(expiresAt)}
      </AlertDescription>
    </Alert>
  );
};

export default TimeRemainingAlert;
