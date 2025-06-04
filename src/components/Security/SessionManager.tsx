
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SessionManagerProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  timeoutMinutes = 30,
  warningMinutes = 5
}) => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!user) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast.warning(
        `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
        {
          duration: 10000,
          action: {
            label: 'Stay logged in',
            onClick: resetTimer
          }
        }
      );
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      toast.error('Session expired due to inactivity. Please log in again.');
      signOut();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only reset if more than 1 minute has passed since last activity
      if (now - lastActivityRef.current > 60000) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, timeoutMinutes, warningMinutes, signOut]);

  return <>{children}</>;
};

export default SessionManager;
