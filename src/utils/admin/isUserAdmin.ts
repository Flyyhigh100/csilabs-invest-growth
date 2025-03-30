
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.log('No active session or session error');
      return false;
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    // Special case for testing account
    if (userEmail && userEmail.toLowerCase() === 'chris.d.conley@gmail.com') {
      // Ensure this account is in the admins table
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', userEmail)
        .maybeSingle();
      
      if (!existingAdmin && !checkError) {
        // Add to admins table if not already there
        await supabase
          .from('admins')
          .insert([{ email: userEmail, id: userId }]);
      }
      
      return true;
    }
    
    // Check if user is in admins table (by email first, then by ID)
    if (userEmail) {
      const { data: adminByEmail, error: emailError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', userEmail);
      
      if (!emailError && Array.isArray(adminByEmail) && adminByEmail.length > 0) {
        return true;
      }
    }
    
    // Fall back to ID check
    const { data: adminById, error: idError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId);
    
    if (!idError && Array.isArray(adminById) && adminById.length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
