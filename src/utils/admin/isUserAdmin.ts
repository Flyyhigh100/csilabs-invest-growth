
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
        
        // Try inserting with proper error handling
        try {
          const { error: insertError } = await supabase
            .from('admins')
            .insert([{ id: userId, email: userEmail.toLowerCase() }]);
          
          if (insertError) {
            console.error('Error automatically adding admin record:', insertError);
            
            // Try upsert as a fallback
            try {
              const { error: upsertError } = await supabase
                .from('admins')
                .upsert([{ id: userId, email: userEmail.toLowerCase() }]);
                
              if (upsertError) {
                console.error('Error upserting admin record:', upsertError);
              }
            } catch (upsertErr) {
              console.error('Exception during admin upsert:', upsertErr);
            }
          }
        } catch (insertErr) {
          console.error('Exception during admin insert:', insertErr);
        }
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
    } catch (idErr) {
      console.error('Exception during admin ID check:', idErr);
    }
    
    // Method 3: Direct query by email
    if (userEmail) {
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
      } catch (emailErr) {
        console.error('Exception during admin email check:', emailErr);
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
        console.error('Error adding self as admin (insert):', insertError);
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
          console.error('Error adding self as admin (upsert):', upsertError);
        }
      } catch (upsertErr) {
        console.error('Exception during admin upsert:', upsertErr);
      }
    }
    
    // Method 3: Try direct SQL if available (removed reference to non-existent RPC function)
    
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
