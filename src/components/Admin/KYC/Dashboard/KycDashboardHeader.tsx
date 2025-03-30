
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Users, CheckCircle, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { testDirectKycAccess, verifyAdminAccess } from '../KycVerificationsService';
import { supabase } from '@/integrations/supabase/client';

interface KycDashboardHeaderProps {
  onManualRefresh: () => void;
  onDirectDatabaseTest: (results: string) => void;
  refetch: () => void;
  onToggleShowAllUsers: () => void;
  showAllUsers: boolean;
}

const KycDashboardHeader: React.FC<KycDashboardHeaderProps> = ({ 
  onManualRefresh, 
  onDirectDatabaseTest,
  refetch,
  onToggleShowAllUsers,
  showAllUsers
}) => {
  const handleDirectDatabaseTest = async () => {
    try {
      // Verify admin access first
      const isAdmin = await verifyAdminAccess();
      if (!isAdmin) {
        toast.error('You do not have admin permissions to test database access');
        return;
      }
      
      toast.loading('Testing direct database access with updated RLS policies...');
      const results = await testDirectKycAccess();
      const resultsJson = JSON.stringify(results, null, 2);
      onDirectDatabaseTest(resultsJson);
      
      toast.success(`Found ${results.count} KYC records in database with updated RLS policies`);
    } catch (error) {
      console.error('Error testing direct database access with updated RLS:', error);
      toast.error('Failed to test direct database access');
    }
  };
  
  const handleVerifyAdminAccess = async () => {
    try {
      toast.loading('Verifying admin access...');
      
      // Get current user info
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error('Not logged in');
        return;
      }
      
      const userId = session.session.user.id;
      const userEmail = session.session.user.email;
      
      toast.info(`Checking admin access for ${userEmail}`);
      
      const isAdmin = await verifyAdminAccess();
      
      if (isAdmin) {
        toast.success('Admin access verified successfully');
      } else {
        toast.error('You do not have admin permissions');
        
        // Display more detailed information for debugging
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*');
        
        if (adminError) {
          console.error('Error checking admins table:', adminError);
          toast.error(`Error checking admins table: ${adminError.message}`);
        } else {
          console.log('All admin records:', adminData);
          toast.info(`Found ${adminData?.length || 0} admin records in database`);
          
          if (adminData && adminData.length > 0) {
            adminData.forEach(admin => {
              console.log(`Admin: ${admin.email} (${admin.id})`);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error verifying admin access:', error);
      toast.error('Failed to verify admin access');
    }
  };
  
  const handleAddCurrentUserAsAdmin = async () => {
    try {
      toast.loading('Adding current user as admin...');
      
      // Get current user info
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error('Not logged in');
        return;
      }
      
      const userId = session.session.user.id;
      const userEmail = session.session.user.email;
      
      if (!userEmail) {
        toast.error('User email not available');
        return;
      }
      
      // Check if already admin
      const { data: existingAdmin, error: existingError } = await supabase
        .from('admins')
        .select('*')
        .or(`id.eq.${userId},email.ilike.${userEmail}`)
        .maybeSingle();
      
      if (existingAdmin) {
        toast.info(`User ${userEmail} is already an admin`);
        return;
      }
      
      // Add to admins table
      const { data, error } = await supabase
        .from('admins')
        .insert([{ id: userId, email: userEmail }])
        .select();
      
      if (error) {
        console.error('Error adding user as admin:', error);
        toast.error(`Failed to add admin: ${error.message}`);
        return;
      }
      
      toast.success(`Successfully added ${userEmail} as admin`);
      
      // Refresh immediately
      refetch();
    } catch (error) {
      console.error('Error adding user as admin:', error);
      toast.error('Failed to add user as admin');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification Requests</CardTitle>
        <CardDescription>
          Review and process KYC verification requests from users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={onManualRefresh} 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh KYC Data
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDirectDatabaseTest} 
            className="flex items-center gap-1"
          >
            <Database className="h-3 w-3" />
            Test DB Connection
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleVerifyAdminAccess} 
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Verify Admin Access
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddCurrentUserAsAdmin} 
            className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <ShieldCheck className="h-3 w-3" />
            Add Self as Admin
          </Button>
          
          <Button 
            variant={showAllUsers ? "default" : "outline"} 
            size="sm" 
            onClick={onToggleShowAllUsers} 
            className="flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            {showAllUsers ? "Hide All Users" : "Show All Users"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDashboardHeader;
