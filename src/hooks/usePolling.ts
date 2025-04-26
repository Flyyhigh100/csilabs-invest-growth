
import { useCallback, useEffect, useRef } from 'react';

export function usePolling(callback: () => Promise<void>, interval: number) {
  const timeoutRef = useRef<number>();
  const isActiveRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    isActiveRef.current = false;
  }, []);

  const poll = useCallback(async () => {
    if (!isActiveRef.current) return;
    
    try {
      await callback();
    } catch (error) {
      console.error('Polling error:', error);
    }
    
    // Schedule next poll if still active
    if (isActiveRef.current) {
      timeoutRef.current = window.setTimeout(poll, interval);
    }
  }, [callback, interval]);

  const startPolling = useCallback(() => {
    if (isActiveRef.current) return;
    
    isActiveRef.current = true;
    poll();
  }, [poll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return { startPolling, stopPolling };
}
