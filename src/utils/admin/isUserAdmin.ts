
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
    
    // Special case: directly approve chris.d.conley@gmail.com as admin (case insensitive)
    if (userEmail && userEmail.toLowerCase() === 'chris.d.conley@gmail.com') {
      console.log(`User ${userEmail} is admin by special case match`);
      
      // Ensure this user is in the admins table
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();
      
      if (!existingAdmin) {
        console.log(`Adding ${userEmail} to admins table automatically`);
        const { error: insertError } = await supabase
          .from('admins')
          .insert([{ id: userId, email: userEmail.toLowerCase() }]);
          
        if (insertError) {
          console.error('Error automatically adding admin record:', insertError);
          
          // Try upsert as a fallback
          const { error: upsertError } = await supabase
            .from('admins')
            .upsert([{ id: userId, email: userEmail.toLowerCase() }]);
            
          if (upsertError) {
            console.error('Error upserting admin record:', upsertError);
          }
        }
      }
      
      toast.success('Admin access granted for chris.d.conley@gmail.com');
      return true;
    }
    
    // Use the new database function to check admin status
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin status with is_admin() function:', error);
      
      // Fall back to the original method if the RPC call fails
      return fallbackAdminCheck(userId, userEmail);
    }
    
    console.log(`Admin check using is_admin() function returned: ${data}`);
    
    if (data === true) {
      return true;
    }
    
    // If the function returns false, try the fallback method as well
    // This ensures smooth transition if some admin entries aren't properly set up
    return await fallbackAdminCheck(userId, userEmail);
  } catch (error) {
    console.error('Error checking admin status:', error);
    toast.error('Failed to verify admin status');
    return false;
  }
};

// Fallback method that checks the admins table directly
const fallbackAdminCheck = async (userId: string, userEmail?: string): Promise<boolean> => {
  try {
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
    
    // Fall back to email check (case insensitive)
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
    
    console.log(`User ${userId} (${userEmail}) is not an admin`);
    return false;
  } catch (error) {
    console.error('Error in fallback admin check:', error);
    return false;
  }
};

// Function to add the current user as an admin
export const addSelfAsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      toast.error('No active session found');
      return false;
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email || '';
    
    console.log(`Attempting to add self as admin: ${userId} (${userEmail})`);
    
    // First check if user is already an admin
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .or(`id.eq.${userId},email.ilike.${userEmail}`)
      .maybeSingle();
      
    if (existingAdmin) {
      toast.info('You are already an admin');
      return true;
    }
    
    // Try to insert the current user as admin
    const { error: insertError } = await supabase
      .from('admins')
      .insert([{ id: userId, email: userEmail.toLowerCase() }]);
      
    if (insertError) {
      console.error('Error adding self as admin:', insertError);
      
      // Try upsert as a fallback
      const { error: upsertError } = await supabase
        .from('admins')
        .upsert([{ id: userId, email: userEmail.toLowerCase() }]);
        
      if (upsertError) {
        console.error('Error upserting admin record:', upsertError);
        toast.error('Failed to add you as admin. There might be a permissions issue.');
        return false;
      }
    }
    
    toast.success('You have been added as an admin!');
    return true;
  } catch (error) {
    console.error('Error adding self as admin:', error);
    toast.error('Failed to add you as an admin');
    return false;
  }
};
