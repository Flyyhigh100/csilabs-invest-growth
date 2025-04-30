
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';

export interface UserTransactionSummary {
  totalCount: number;
  totalValue: number;
  latestDate: string | null;
  successRate: number;
  paymentMethods: {
    method: string;
    count: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
  }[];
}

export interface UseUserTransactionsProps {
  userId?: string;
  dateRange?: { from: Date; to: Date };
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export const useUserTransactions = ({
  userId,
  dateRange,
  status,
  paymentMethod,
  minAmount,
  maxAmount,
  searchQuery
}: UseUserTransactionsProps = {}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Fetch transactions for specific user
  const {
    data: transactions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-transactions', userId, dateRange, status, paymentMethod, minAmount, maxAmount, searchQuery],
    queryFn: async () => {
      try {
        if (!userId) return [];

        console.log(`Fetching transactions for user ${userId} with filters:`, {
          dateRange,
          status,
          paymentMethod,
          minAmount,
          maxAmount,
          searchQuery
        });

        // Start with the base query
        let query = supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (userId) {
          query = query.eq('user_id', userId);
        }

        if (dateRange?.from) {
          query = query.gte('created_at', dateRange.from.toISOString());
        }

        if (dateRange?.to) {
          query = query.lte('created_at', dateRange.to.toISOString());
        }

        if (status) {
          query = query.eq('status', status);
        }

        if (paymentMethod) {
          query = query.eq('payment_method', paymentMethod);
        }

        if (minAmount !== undefined) {
          query = query.gte('amount', minAmount);
        }

        if (maxAmount !== undefined) {
          query = query.lte('amount', maxAmount);
        }

        // Execute the query
        const { data, error } = await query;

        if (error) throw error;

        // Apply search filtering in memory (since we can't easily do this in the database query)
        let filteredData = data;
        if (searchQuery) {
          const lowerSearchQuery = searchQuery.toLowerCase();
          filteredData = data.filter(tx => 
            tx.transaction_id?.toLowerCase().includes(lowerSearchQuery) ||
            tx.payment_method?.toLowerCase().includes(lowerSearchQuery) ||
            tx.wallet_address?.toLowerCase().includes(lowerSearchQuery) ||
            tx.admin_notes?.toLowerCase().includes(lowerSearchQuery)
          );
        }

        console.log(`Found ${filteredData.length} transactions for user ${userId}`);
        return filteredData as Transaction[];
      } catch (err) {
        console.error("Error fetching user transactions:", err);
        throw err;
      }
    },
    enabled: !!userId,
  });

  // Calculate summary metrics
  const calculateSummary = (): UserTransactionSummary => {
    if (!transactions.length) {
      return {
        totalCount: 0,
        totalValue: 0,
        latestDate: null,
        successRate: 0,
        paymentMethods: [],
        statusBreakdown: []
      };
    }

    // Get latest transaction date
    const sortedByDate = [...transactions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestDate = sortedByDate.length > 0 ? sortedByDate[0].created_at : null;

    // Calculate success rate
    const completedTransactions = transactions.filter(tx => tx.status === 'completed');
    const successRate = transactions.length > 0 
      ? (completedTransactions.length / transactions.length) * 100 
      : 0;

    // Group by payment method
    const methodCounts: Record<string, number> = {};
    transactions.forEach(tx => {
      const method = tx.payment_method || 'unknown';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    // Group by status
    const statusCounts: Record<string, number> = {};
    transactions.forEach(tx => {
      const status = tx.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Calculate total value
    const totalValue = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return {
      totalCount: transactions.length,
      totalValue,
      latestDate,
      successRate,
      paymentMethods: Object.entries(methodCounts).map(([method, count]) => ({ method, count })),
      statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
    };
  };

  const summary = calculateSummary();

  const exportToCSV = () => {
    if (!transactions.length) {
      toast.error("No data to export");
      return;
    }

    try {
      // Format data for CSV
      const headers = [
        'Date', 
        'Transaction ID', 
        'Amount', 
        'Status', 
        'Payment Method', 
        'Wallet Address', 
        'Token Sent'
      ];

      const csvData = transactions.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.transaction_id,
        tx.amount,
        tx.status,
        tx.payment_method,
        tx.wallet_address,
        tx.token_sent ? 'Yes' : 'No'
      ]);

      // Convert to CSV format
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `user-transactions-${userId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (err) {
      console.error("Error exporting to CSV:", err);
      toast.error("Failed to export data");
    }
  };

  return {
    transactions,
    isLoading,
    error,
    summary,
    refetch,
    selectedTransaction,
    setSelectedTransaction,
    exportToCSV
  };
};
