
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Key for storing the test data preference in localStorage
const TEST_DATA_STORAGE_KEY = 'admin_include_test_data';

/**
 * Custom hook for managing the test/real data toggle across the admin interface
 * Persists the preference in localStorage and syncs it across tabs
 */
export const useTestDataToggle = () => {
  // Initialize from localStorage or default to false (real data only)
  const [includeTestData, setIncludeTestData] = useState<boolean>(() => {
    try {
      const savedPreference = localStorage.getItem(TEST_DATA_STORAGE_KEY);
      return savedPreference ? JSON.parse(savedPreference) : false;
    } catch (error) {
      console.error('Error reading test data preference from localStorage:', error);
      return false;
    }
  });

  // Function to toggle the test data state
  const toggleTestData = useCallback(() => {
    setIncludeTestData(prev => !prev);
    toast.info(
      `Showing ${!includeTestData ? 'both real and test data' : 'only real data'}`, 
      { id: 'test-data-toggle' }
    );
  }, [includeTestData]);

  // Save to localStorage whenever the setting changes
  useEffect(() => {
    try {
      localStorage.setItem(TEST_DATA_STORAGE_KEY, JSON.stringify(includeTestData));
      console.log(`Test data preference saved: ${includeTestData}`);
    } catch (error) {
      console.error('Error saving test data preference to localStorage:', error);
    }
  }, [includeTestData]);
  
  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TEST_DATA_STORAGE_KEY) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : false;
          setIncludeTestData(newValue);
          console.log(`Test data preference updated from another tab: ${newValue}`);
        } catch (error) {
          console.error('Error parsing test data preference from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Notify user when test data is being included
  useEffect(() => {
    // Don't show on initial mount
    if (includeTestData) {
      const timer = setTimeout(() => {
        toast.info('You are viewing test data alongside real data', {
          id: 'test-data-active',
          duration: 3000,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [includeTestData]);

  return {
    includeTestData,
    setIncludeTestData,
    toggleTestData
  };
};
