import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Search, User, Mail, Calendar, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSignupDetail {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  kyc_status?: 'not_started' | 'pending' | 'approved' | 'rejected' | 'needs_clarification';
}

interface UserSignupDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
}

const UserSignupDetailDialog: React.FC<UserSignupDetailDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
}) => {
  const [users, setUsers] = useState<UserSignupDetail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSignupDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && selectedDate) {
      fetchUsersForDate(selectedDate);
    }
  }, [open, selectedDate]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsersForDate = async (date: string) => {
    setLoading(true);
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      // Get users who signed up on the selected date
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at
        `)
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (authError) throw authError;

      // Get KYC status for these users
      const userIds = authUsers?.map(u => u.id) || [];
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('user_id, status')
        .in('user_id', userIds);

      if (kycError) throw kycError;

      // Combine the data
      const usersWithKyc = authUsers?.map(user => ({
        ...user,
        kyc_status: kycData?.find(kyc => kyc.user_id === user.id)?.status || 'not_started'
      })) || [];

      setUsers(usersWithKyc);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_clarification':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Signup Time', 'KYC Status'],
      ...filteredUsers.map(user => [
        `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        user.email,
        new Date(user.created_at).toLocaleString(),
        user.kyc_status || 'not_started'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-signups-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Downloaded ${filteredUsers.length} user records`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Signups for {selectedDate ? formatDate(selectedDate) : 'Selected Date'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header with search and export */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredUsers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{filteredUsers.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredUsers.filter(u => u.kyc_status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">KYC Approved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredUsers.filter(u => u.kyc_status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">KYC Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {filteredUsers.filter(u => u.kyc_status === 'not_started').length}
                </div>
                <div className="text-sm text-muted-foreground">No KYC</div>
              </div>
            </div>
          </div>

          {/* User list */}
          <ScrollArea className="h-[400px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found for this date
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'No name provided'
                          }
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={getKycStatusColor(user.kyc_status || 'not_started')}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.kyc_status === 'not_started' ? 'No KYC' : 
                         user.kyc_status === 'needs_clarification' ? 'Needs Review' :
                         user.kyc_status?.charAt(0).toUpperCase() + user.kyc_status?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSignupDetailDialog;