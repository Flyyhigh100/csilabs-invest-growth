
import { useState, useEffect } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get from session storage if it exists
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  };
  
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Clear old sessionStorage items on component mount
  useEffect(() => {
    // Clean up old sessions
    try {
      // Get all keys in sessionStorage
      const keys = Object.keys(sessionStorage);
      
      // Current timestamp
      const now = Date.now();
      
      // Look for expired crypto onramp sessions (older than 1 hour)
      keys.forEach(storageKey => {
        if (storageKey.startsWith('crypto_onramp_session')) {
          try {
            const sessionData = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
            if (sessionData.timestamp && (now - sessionData.timestamp > 3600000)) {
              // Remove sessions older than 1 hour
              sessionStorage.removeItem(storageKey);
              console.log(`Removed expired session: ${storageKey}`);
            }
          } catch (e) {
            // If parsing fails, remove the item
            sessionStorage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn("Error cleaning sessionStorage:", error);
    }
  }, []);
  
  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to session storage
      if (typeof window !== 'undefined') {
        // Convert to string and calculate size
        const strValue = JSON.stringify(valueToStore);
        const valueSize = new Blob([strValue]).size;
        
        // Check if we're likely to exceed the quota (typical limit is around 5MB)
        if (valueSize > 4 * 1024 * 1024) {
          console.warn(`Value for "${key}" is very large (${valueSize} bytes), may exceed storage quota`);
        }
        
        try {
          window.sessionStorage.setItem(key, strValue);
        } catch (storageError) {
          // Handle storage quota exceeded
          if (storageError.name === 'QuotaExceededError' ||
              storageError.code === 22 ||
              storageError.code === 1014) {
            
            console.warn(`Storage quota exceeded for key "${key}". Attempting cleanup.`);
            
            // Try to free up space by removing other items
            try {
              // Get all keys
              const allKeys = Object.keys(sessionStorage);
              
              // Remove non-essential items first
              for (const storageKey of allKeys) {
                if (storageKey !== key && !storageKey.startsWith('stripe_')) {
                  sessionStorage.removeItem(storageKey);
                }
              }
              
              // Try again
              window.sessionStorage.setItem(key, strValue);
            } catch (retryError) {
              console.error(`Still unable to save to sessionStorage after cleanup: ${retryError.message}`);
            }
          } else {
            console.error(`Error setting sessionStorage key "${key}":`, storageError);
          }
        }
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };
  
  useEffect(() => {
    setStoredValue(readValue());
  }, []);
  
  return [storedValue, setValue];
}
