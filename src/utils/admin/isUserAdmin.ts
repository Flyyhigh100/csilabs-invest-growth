
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
    
    // Special case for testing account
    if (userEmail && userEmail.toLowerCase() === 'chris.d.conley@gmail.com') {
      console.log('Special test account detected - granting admin access directly');
      
      // Ensure this account is in the admins table
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admins')
        .select('*')
        .or(`id.eq.${userId},email.ilike.${userEmail}`)
        .maybeSingle();
      
      if (!existingAdmin && !checkError) {
        // Add to admins table if not already there
        console.log(`Adding special test account ${userEmail} to admins table`);
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
        .ilike('email', userEmail)
        .maybeSingle();
      
      if (!emailError && adminByEmail) {
        console.log(`User found in admins table by email: ${userEmail}`);
        return true;
      }
    }
    
    // Fall back to ID check
    const { data: adminById, error: idError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!idError && adminById) {
      console.log(`User found in admins table by ID: ${userId}`);
      return true;
    }
    
    // As a fallback for development, check email patterns
    if (userEmail && (
      userEmail.toLowerCase().includes('admin') ||
      userEmail.toLowerCase().includes('test')
    )) {
      console.log(`Adding user with admin-like email ${userEmail} to admins table`);
      try {
        const { error } = await supabase
          .from('admins')
          .insert([{ id: userId, email: userEmail }]);
          
        if (!error) {
          return true;
        }
      } catch (e) {
        console.error('Error adding admin by pattern match:', e);
      }
    }
    
    console.log(`User ${userId} (${userEmail}) is not an admin`);
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
