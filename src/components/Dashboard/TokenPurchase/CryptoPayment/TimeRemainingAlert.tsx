
import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface TimeRemainingAlertProps {
  expiresAt: string | Date;
}

const TimeRemainingAlert: React.FC<TimeRemainingAlertProps> = ({ expiresAt }) => {
  const calculateTimeRemaining = () => {
    try {
      const now = new Date();
      // Ensure expiration date is properly parsed regardless of format
      let expiration: Date;
      
      if (typeof expiresAt === 'string') {
        // Check if it's a numeric timestamp or a date string
        if (/^\d+$/.test(expiresAt)) {
          // Convert numeric string to number and interpret as milliseconds
          expiration = new Date(parseInt(expiresAt));
        } else {
          // Try to parse the date string directly
          expiration = new Date(expiresAt);
        }
      } else {
        // It's already a Date object
        expiration = expiresAt;
      }
      
      // Check if the date is valid
      if (isNaN(expiration.getTime())) {
        console.error('Invalid expiration date:', expiresAt);
        // Default to expired if invalid date
        return { expired: true, minutes: 0, seconds: 0 };
      }
      
      const diff = expiration.getTime() - now.getTime();
      
      if (diff <= 0) return { expired: true, minutes: 0, seconds: 0 };
      
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      return { expired: false, minutes, seconds };
    } catch (error) {
      console.error('Error calculating time remaining:', error, 'expiresAt:', expiresAt);
      // Default to expired on error
      return { expired: true, minutes: 0, seconds: 0 };
    }
  };
  
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  if (timeRemaining.expired) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Expired</AlertTitle>
        <AlertDescription>
          This payment request has expired. Please create a new payment.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <Clock className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-700">Time Remaining</AlertTitle>
      <AlertDescription className="text-amber-600">
        This payment request will expire in {timeRemaining.minutes.toString().padStart(2, '0')}:{timeRemaining.seconds.toString().padStart(2, '0')} minutes
      </AlertDescription>
    </Alert>
  );
};

export default TimeRemainingAlert;
