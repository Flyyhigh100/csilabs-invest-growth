
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

  // Save preference to user's profile in Supabase (if logged in)
  useEffect(() => {
    const savePreferenceToProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from('profiles')
            .update({
              admin_preferences: {
                include_test_data: includeTestData,
                ...((await supabase.from('profiles').select('admin_preferences').eq('id', user.id).single()).data?.admin_preferences || {})
              }
            })
            .eq('id', user.id);
        } catch (error) {
          console.error('Failed to save test data preference to profile:', error);
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
