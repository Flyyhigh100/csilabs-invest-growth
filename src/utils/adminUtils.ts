import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return false;
    }
    
    if (!session || !session.user) {
      console.log('No active session or user found');
      return false;
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    console.log('Checking admin status for user:', { id: userId, email: userEmail });
    
    // --- DEBUGGING ---
    console.log('Chris.d.conley@gmail.com should be an admin, adding them directly to the database');
    
    // For chris.d.conley@gmail.com, directly add to admins table if not already there
    if (userEmail && userEmail.toLowerCase() === 'chris.d.conley@gmail.com') {
      // First check if already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', userEmail)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking if admin exists:', checkError);
      } else if (!existingAdmin) {
        console.log('Adding chris.d.conley@gmail.com as admin');
        // Insert the admin record
        const { error: insertError } = await supabase
          .from('admins')
          .insert([{ email: userEmail, id: userId }]);
        
        if (insertError) {
          console.error('Error adding admin:', insertError);
        } else {
          console.log('Successfully added as admin');
          return true;
        }
      } else {
        console.log('Admin already exists:', existingAdmin);
        return true;
      }
    }
    
    try {
      // Check if email exists in admins table (case insensitive)
      if (userEmail) {
        console.log('Checking admin by email (case insensitive):', userEmail);
        const { data: emailData, error: emailError } = await supabase
          .from('admins')
          .select('*')
          .ilike('email', userEmail);
        
        if (emailError) {
          console.error('Error checking admin by email:', emailError);
        } else if (Array.isArray(emailData) && emailData.length > 0) {
          console.log('Admin confirmed by email:', emailData);
          return true;
        } else {
          // Also try an exact match in case ilike doesn't work as expected
          const { data: exactEmailData, error: exactEmailError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', userEmail);
          
          if (exactEmailError) {
            console.error('Error checking admin by exact email:', exactEmailError);
          } else if (Array.isArray(exactEmailData) && exactEmailData.length > 0) {
            console.log('Admin confirmed by exact email match:', exactEmailData);
            return true;
          } else {
            console.log('Admin check by email returned no results. Tried both ilike and exact match.');
          }
        }
      }
      
      // Also check by user ID as a fallback
      console.log('Checking admin by ID:', userId);
      const { data: idData, error: idError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId);
      
      if (idError) {
        console.error('Error checking admin by ID:', idError);
      } else if (Array.isArray(idData) && idData.length > 0) {
        console.log('Admin confirmed by ID:', idData);
        return true;
      } else {
        console.log('Admin check by ID returned no results');
      }
      
      // Detailed logging to help debug
      console.log('User is not an admin. Checking admins table content for debugging:');
      const { data: allAdmins, error: allAdminsError } = await supabase
        .from('admins')
        .select('*');
      
      if (allAdminsError) {
        console.error('Error fetching all admins for debugging:', allAdminsError);
      } else {
        console.log('Current admins in the database:', allAdmins);
      }
    } catch (fetchError) {
      // Handle any network or unexpected errors in the database queries
      console.error('Exception during admin checks:', fetchError);
      // Return false instead of rethrowing to prevent promise rejection
      return false;
    }
    
    console.log('User is not an admin');
    return false;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    // Return false rather than rethrowing to prevent unhandled promise rejection
    return false;
  }
};

export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected', 
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    } else if (status === 'approved') {
      updateData.rejection_reason = null;
    }
    
    const { error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId);
    
    if (error) {
      console.error('Error updating KYC verification:', error);
      toast.error('Failed to update KYC verification');
      return false;
    }
    
    toast.success(`KYC verification ${status}`);
    return true;
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    toast.error('An error occurred while processing KYC verification');
    return false;
  }
};

export const markTokensAsSent = async (
  transactionId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        token_sent: true,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
    
    if (error) {
      console.error('Error marking tokens as sent:', error);
      toast.error('Failed to update transaction');
      return false;
    }
    
    toast.success('Transaction updated successfully');
    return true;
  } catch (error) {
    console.error('Error marking tokens as sent:', error);
    toast.error('An error occurred while updating transaction');
    return false;
  }
};
