import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import TransactionList from './TransactionList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from '../EmptyState';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import IPNLogViewer from './IPNLogViewer';

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

  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', user?.id],
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[60px]" />
        <Skeleton className="w-full h-[60px]" />
        <Skeleton className="w-full h-[60px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load transactions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isKycApproved && !allowTransactionsWithoutKYC) {
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50">
        <ShieldAlert className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">KYC Required</AlertTitle>
        <AlertDescription className="text-amber-700">
          You need to complete KYC verification before making transactions.
        </AlertDescription>
      </Alert>
    );
  }
  
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

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAdminView}
          >
            {isAdminView ? 'Show My Transactions' : 'Show All Transactions (Admin)'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
          >
            Refresh All Pending Transactions
          </Button>
        </div>
      )}

      <TransactionList 
        transactions={transactions as Transaction[]} 
        isAdminView={isAdminView && !!isAdmin}
        onTransactionUpdated={handleTransactionUpdated}
      />
      
      {isAdmin && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">IPN Log Viewer (Admin)</h3>
          <IPNLogViewer />
        </div>
      )}
    </div>
  );
};

export default TransactionContent;
