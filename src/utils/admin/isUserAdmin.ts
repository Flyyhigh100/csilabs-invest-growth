
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
    
    console.log(`Checking admin status for user ${userId} (${userEmail})`);
    
    // Check if user is in admins table (by ID first, then by email)
    const { data: adminById, error: idError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!idError && adminById) {
      console.log(`User found in admins table by ID: ${userId}`);
      return true;
    }
    
    // Fall back to email check
    if (userEmail) {
      const { data: adminByEmail, error: emailError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', userEmail)
        .maybeSingle();
      
      if (!emailError && adminByEmail) {
        console.log(`User found in admins table by email: ${userEmail}`);
        // Update the admin record with the user's ID if it's missing
        if (!adminByEmail.id) {
          await supabase
            .from('admins')
            .update({ id: userId })
            .eq('email', userEmail);
        }
        return true;
      }
    }
    
    // Special email check for test accounts (optional, can be removed in production)
    if (userEmail && (
      userEmail.toLowerCase().includes('admin') ||
      userEmail.toLowerCase().includes('test') ||
      userEmail.toLowerCase() === 'chris.d.conley@gmail.com'
    )) {
      console.log(`User has admin-like email ${userEmail} - adding to admins table`);
      try {
        const { error } = await supabase
          .from('admins')
          .insert([{ id: userId, email: userEmail }]);
          
        if (!error) {
          console.log(`Successfully added ${userEmail} to admins table`);
          return true;
        } else {
          console.error('Error adding admin by special email pattern:', error);
          toast.error('Failed to add admin user. You may need to refresh or add yourself as admin manually.');
        }
      } catch (e) {
        console.error('Exception adding admin by special email pattern:', e);
      }
    }
    
    console.log(`User ${userId} (${userEmail}) is not an admin`);
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    toast.error('Failed to verify admin status');
    return false;
  }
};
