
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a user is an admin by their ID
 */
export const checkAdminById = async (userId: string): Promise<boolean> => {
  try {
    const { data: adminById, error: idError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!idError && adminById) {
      console.log(`User found in admins table by ID: ${userId}`);
      return true;
    }
    
    if (idError) {
      console.error('Error checking admin by ID:', idError);
    }
    
    return false;
  } catch (idErr) {
    console.error('Exception during admin ID check:', idErr);
    return false;
  }
};

/**
 * Check if a user is an admin by their email
 * If found, updates the admin record with the user's ID if it's missing
 */
export const checkAdminByEmail = async (userId: string, userEmail: string): Promise<boolean> => {
  try {
    const { data: adminByEmail, error: emailError } = await supabase
      .from('admins')
      .select('*')
      .ilike('email', userEmail)
      .maybeSingle();
    
    if (!emailError && adminByEmail) {
      console.log(`User found in admins table by email: ${userEmail}`);
      
      // Update the admin record with the user's ID if it's missing
      if (!adminByEmail.id) {
        try {
          await supabase
            .from('admins')
            .update({ id: userId })
            .eq('email', userEmail);
        } catch (updateErr) {
          console.error('Exception updating admin ID:', updateErr);
        }
      }
      
      return true;
    }
    
    if (emailError) {
      console.error('Error checking admin by email:', emailError);
    }
    
    return false;
  } catch (emailErr) {
    console.error('Exception during admin email check:', emailErr);
    return false;
  }
};
