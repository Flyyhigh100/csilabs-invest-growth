
import { useState, useEffect } from 'react';

// Use sessionStorage to share the state across components
const STORAGE_KEY = 'admin_include_test_data';

export const useTestDataToggle = (initialValue = false) => {
  // Initialize from sessionStorage if available
  const storedValue = typeof window !== 'undefined' 
    ? sessionStorage.getItem(STORAGE_KEY) 
    : null;
  
  const [includeTestData, setIncludeTestData] = useState<boolean>(
    storedValue !== null ? storedValue === 'true' : initialValue
  );
  
  // Sync with sessionStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, String(includeTestData));
    }
  }, [includeTestData]);
  
  return {
    includeTestData,
    setIncludeTestData,
  };
};

// Export a global instance for components that don't need local state
export const useGlobalTestDataToggle = () => {
  return useTestDataToggle(false);
};
