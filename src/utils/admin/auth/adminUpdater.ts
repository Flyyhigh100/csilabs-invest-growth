
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates or creates an admin record
 * @returns boolean indicating success or failure
 */
export const updateAdminRecord = async (userId: string, userEmail: string): Promise<boolean> => {
  // Try multiple methods to add admin
  let success = false;
  
  // Method 1: Try insert
  try {
    const { error: insertError } = await supabase
      .from('admins')
      .insert([{ id: userId, email: userEmail.toLowerCase() }]);
      
    if (!insertError) {
      success = true;
    } else {
      console.error('Error adding admin record (insert):', insertError);
    }
  } catch (insertErr) {
    console.error('Exception during admin insert:', insertErr);
  }
  
  // Method 2: Try upsert if insert failed
  if (!success) {
    try {
      const { error: upsertError } = await supabase
        .from('admins')
        .upsert([{ id: userId, email: userEmail.toLowerCase() }]);
        
      if (!upsertError) {
        success = true;
      } else {
        console.error('Error adding admin record (upsert):', upsertError);
      }
    } catch (upsertErr) {
      console.error('Exception during admin upsert:', upsertErr);
    }
  }
  
  return success;
};
