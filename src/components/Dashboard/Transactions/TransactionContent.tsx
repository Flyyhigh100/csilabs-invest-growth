
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import TransactionList from './TransactionList';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from '../EmptyState';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionLoadingState from './TransactionLoadingState';
import TransactionErrorState from './TransactionErrorState';
import KycRequiredAlert from './KycRequiredAlert';
import AdminControls from './AdminControls';
import AdminIpnLogSection from './AdminIpnLogSection';

interface TransactionContentProps {
  isKycApproved: boolean;
  allowTransactionsWithoutKYC: boolean;
}

const TransactionContent = ({ 
  isKycApproved,
  allowTransactionsWithoutKYC 
}: TransactionContentProps) => {
  const { user } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const { refreshAllPendingTransactions } = useCryptoStatusCheck();

  // Check if the user is an admin
  const { data: isAdmin, isLoading: isAdminChecking } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('is_admin');
        
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user
  });

  // Fetch transactions
  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', user?.id, isAdminView],
    queryFn: async () => {
      if (!user) return [];
      
      if (isAdminView && isAdmin) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*, profiles:user_id(first_name, last_name, email)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Set up real-time updates
  useEffect(() => {
    if (!user) return;
    
    const transactionsSubscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: isAdminView && isAdmin 
          ? undefined 
          : `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Transaction update received:', payload);
        refetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(transactionsSubscription);
    };
  }, [user, refetch, isAdminView, isAdmin]);

  // Event handlers
  const handleRefreshAll = async () => {
    await refreshAllPendingTransactions(true);
    refetch();
  };

  const handleTransactionUpdated = () => {
    refetch();
  };

  const toggleAdminView = () => {
    setIsAdminView(prev => !prev);
  };

  // Loading state
  if (isLoading) {
    return <TransactionLoadingState />;
  }

  // Error state
  if (error) {
    return <TransactionErrorState />;
  }

  // KYC check
  if (!isKycApproved && !allowTransactionsWithoutKYC) {
    return <KycRequiredAlert />;
  }
  
  // Empty state
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState 
        title="No transactions yet"
        description="Your transaction history will appear here once you make your first purchase."
        icon={Info}
        action={
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard/payments'}
          >
            Buy Tokens
          </Button>
        }
      />
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      {isAdmin && (
        <AdminControls 
          isAdminView={isAdminView}
          toggleAdminView={toggleAdminView}
          handleRefreshAll={handleRefreshAll}
        />
      )}

      <TransactionList 
        transactions={transactions as Transaction[]} 
        isAdminView={isAdminView && !!isAdmin}
        onTransactionUpdated={handleTransactionUpdated}
      />
      
      {isAdmin && <AdminIpnLogSection />}
    </div>
  );
};

export default TransactionContent;
