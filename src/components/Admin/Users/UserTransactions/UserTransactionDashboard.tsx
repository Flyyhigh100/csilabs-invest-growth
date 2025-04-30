
import React, { useState } from 'react';
import { useUserTransactions } from '@/hooks/admin/useUserTransactions';
import TransactionSummaryCards from './TransactionSummaryCards';
import TransactionCharts from './TransactionCharts';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import TransactionDetailSheet from './TransactionDetailSheet';

interface UserTransactionDashboardProps {
  userId: string;
}

const UserTransactionDashboard: React.FC<UserTransactionDashboardProps> = ({ userId }) => {
  const [filters, setFilters] = useState<any>({});
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  
  const {
    transactions,
    isLoading,
    error,
    summary,
    selectedTransaction,
    setSelectedTransaction,
    exportToCSV,
  } = useUserTransactions({
    userId,
    ...filters
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSelectTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailSheetOpen(true);
  };

  if (error) {
    return (
      <div className="rounded-md border p-6 text-center bg-red-50 text-red-800">
        <p className="font-medium">Error loading transactions</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TransactionSummaryCards 
        summary={summary} 
        isLoading={isLoading} 
      />
      
      <TransactionCharts summary={summary} />
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <TransactionFilters 
          onFilterChange={handleFilterChange} 
          onExportCSV={exportToCSV}
        />
        
        <div className="mt-4">
          <TransactionTable
            transactions={transactions}
            isLoading={isLoading}
            onSelectTransaction={handleSelectTransaction}
          />
        </div>
      </div>
      
      <TransactionDetailSheet
        transaction={selectedTransaction}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </div>
  );
};

export default UserTransactionDashboard;
