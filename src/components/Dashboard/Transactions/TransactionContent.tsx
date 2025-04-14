
import React, { useEffect } from 'react';
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

interface TransactionContentProps {
  isKycApproved: boolean;
  allowTransactionsWithoutKYC: boolean;
}

const TransactionContent = ({ 
  isKycApproved,
  allowTransactionsWithoutKYC 
}: TransactionContentProps) => {
  const { user } = useAuth();

  // Fetch transactions
  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
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
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Transaction update received:', payload);
        refetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(transactionsSubscription);
    };
  }, [user, refetch]);

  // Event handlers
  const handleTransactionUpdated = () => {
    refetch();
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
      <TransactionList 
        transactions={transactions as Transaction[]} 
        onTransactionUpdated={handleTransactionUpdated}
      />
    </div>
  );
};

export default TransactionContent;
