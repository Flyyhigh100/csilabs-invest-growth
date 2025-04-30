
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTransactionSummary } from '@/hooks/admin/useUserTransactions';
import { formatCurrency } from '@/utils/format';
import { CircleDollarSign, CalendarDays, BarChart3, Percent } from 'lucide-react';

interface TransactionSummaryCardsProps {
  summary: UserTransactionSummary;
  isLoading: boolean;
}

const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
            Total Transactions
          </CardTitle>
          <CardDescription>All time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CircleDollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            Total Value
          </CardTitle>
          <CardDescription>All transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
            Success Rate
          </CardTitle>
          <CardDescription>Completed transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.successRate.toFixed(0)}%</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            Latest Transaction
          </CardTitle>
          <CardDescription>Date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.latestDate 
              ? new Date(summary.latestDate).toLocaleDateString() 
              : 'No transactions'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummaryCards;
