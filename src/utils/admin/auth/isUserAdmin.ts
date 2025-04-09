
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkAdminByEmail, checkAdminById } from './adminCheckers';
import { updateAdminRecord } from './adminUpdater';

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
    
    // Special case: directly approve known admin email as admin (case insensitive)
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
        await updateAdminRecord(userId, userEmail);
      }
      
      toast.success('Admin access granted for chris.d.conley@gmail.com');
      return true;
    }
    
    // Try multiple methods to check admin status for reliability
    try {
      // Method 1: Use the database function to check admin status
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin');
      
      if (!rpcError && rpcResult === true) {
        console.log('Admin check using is_admin() function returned: true');
        return true;
      }
      
      if (rpcError) {
        console.error('Error checking admin status with is_admin() function:', rpcError);
      } else {
        console.log('Admin check using is_admin() function returned:', rpcResult);
      }
    } catch (rpcErr) {
      console.error('Exception during RPC admin check:', rpcErr);
    }
    
    // Method 2: Direct query by ID
    const isAdminById = await checkAdminById(userId);
    if (isAdminById) {
      return true;
    }
    
    // Method 3: Direct query by email
    if (userEmail) {
      const isAdminByEmail = await checkAdminByEmail(userId, userEmail);
      if (isAdminByEmail) {
        return true;
      }
    }
    
    // If all methods fail, the user is not an admin
    console.log(`User ${userId} (${userEmail}) is not an admin`);
    return false;
  } catch (error) {
    console.error('Error in main isUserAdmin function:', error);
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
    
    const success = await updateAdminRecord(userId, userEmail);
    
    if (success) {
      toast.success('You have been added as an admin!');
      return true;
    }
    
    toast.error('Failed to add you as an admin. There might be a permissions issue.');
    return false;
  } catch (error) {
    console.error('Error adding self as admin:', error);
    toast.error('Failed to add you as an admin');
    return false;
  }
};
