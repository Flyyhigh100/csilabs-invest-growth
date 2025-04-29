
import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeRemainingAlertProps {
  expiresAt: string;
}

const TimeRemainingAlert: React.FC<TimeRemainingAlertProps> = ({ expiresAt }) => {
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      try {
        const expiryTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        const diff = expiryTime - now;
        
        if (diff <= 0) {
          setMinutesRemaining(0);
          return;
        }
        
        // Convert to minutes and round up
        const minutes = Math.ceil(diff / (1000 * 60));
        setMinutesRemaining(minutes);
      } catch (e) {
        console.error("Error calculating time remaining:", e);
        setMinutesRemaining(0);
      }
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // Then update every minute
    const intervalId = setInterval(calculateTimeRemaining, 60000);
    
    return () => clearInterval(intervalId);
  }, [expiresAt]);
  
  if (minutesRemaining <= 0) {
    return (
      <Alert variant="destructive">
        <Timer className="h-4 w-4" />
        <AlertDescription>
          This payment request has expired. Please create a new one.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show warning when less than 10 minutes remain
  const isUrgent = minutesRemaining <= 10;
  
  return (
    <Alert variant={isUrgent ? "warning" : "default"} className={isUrgent ? "bg-amber-50 border-amber-200" : ""}>
      <Timer className={`h-4 w-4 ${isUrgent ? "text-amber-600" : ""}`} />
      <AlertDescription className={isUrgent ? "text-amber-800" : ""}>
        {minutesRemaining > 60 ? (
          `Payment request valid for ${Math.floor(minutesRemaining / 60)} hours and ${minutesRemaining % 60} minutes`
        ) : (
          `Payment request valid for ${minutesRemaining} ${minutesRemaining === 1 ? 'minute' : 'minutes'}`
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TimeRemainingAlert;
