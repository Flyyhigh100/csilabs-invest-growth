
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Key for storing the test data preference in localStorage
const TEST_DATA_STORAGE_KEY = 'admin_include_test_data';

/**
 * Custom hook for managing the test/real data toggle across the admin interface
 * Persists the preference in localStorage and syncs it across tabs
 */
export const useTestDataToggle = () => {
  // Initialize from localStorage or default to false (real data only)
  const [includeTestData, setIncludeTestData] = useState(() => {
    const savedPreference = localStorage.getItem(TEST_DATA_STORAGE_KEY);
    return savedPreference ? JSON.parse(savedPreference) : false;
  });

  // Sync the setting across tabs and persist to localStorage
  useEffect(() => {
    // Save to localStorage whenever the setting changes
    localStorage.setItem(TEST_DATA_STORAGE_KEY, JSON.stringify(includeTestData));
    
    // Listen for changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TEST_DATA_STORAGE_KEY) {
        setIncludeTestData(e.newValue ? JSON.parse(e.newValue) : false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [includeTestData]);

  // Instead of directly accessing a non-existent column, we'll use a separate approach
  // Store preference in a user note field or simply rely on localStorage
  useEffect(() => {
    const savePreferenceToProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          // Check if the user exists in the database first
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError) {
            console.error('Failed to fetch user profile:', userError);
            return;
          }

          // Since admin_preferences column doesn't exist, we won't try to update it
          // This is a simplified approach that relies solely on localStorage
          // You could add a separate table for admin preferences if needed in the future
          console.log('Test data preference saved to localStorage for user:', user.id);
        } catch (error) {
          console.error('Error in savePreferenceToProfile:', error);
        }
      }
    };
    
    savePreferenceToProfile();
  }, [includeTestData]);

  return {
    includeTestData,
    setIncludeTestData,
    toggleTestData: () => setIncludeTestData(prev => !prev)
  };
};
