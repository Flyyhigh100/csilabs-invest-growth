
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeRemainingAlertProps {
  expiresAt: string;
}

const TimeRemainingAlert: React.FC<TimeRemainingAlertProps> = ({ expiresAt }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const expiresAtDate = new Date(expiresAt);
      const now = new Date();
      
      const diffMs = expiresAtDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }
      
      setIsExpired(false);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      
      if (diffHours > 0) {
        setTimeRemaining(`${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`);
      } else {
        setTimeRemaining(`${diffMins} minute${diffMins !== 1 ? 's' : ''}`);
      }
    };

    // Calculate immediately
    calculateTimeRemaining();
    
    // Update every second
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (isExpired) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Payment Time Expired</AlertTitle>
        <AlertDescription className="text-red-700">
          This payment request has expired. Please create a new payment to continue.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <Clock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Time Remaining</AlertTitle>
      <AlertDescription className="text-amber-700">
        This payment request will expire in {timeRemaining}
      </AlertDescription>
    </Alert>
  );
};

export default TimeRemainingAlert;

