
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ArrowUp, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { UserTransactionSummary } from '@/hooks/admin/useUserTransactions';

interface TransactionSummaryCardsProps {
  summary: UserTransactionSummary;
  isLoading: boolean;
}

const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="mt-3">
                <Skeleton className="h-6 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Total Value</p>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold">{formatCurrency(summary.totalValue)}</h4>
            <p className="text-xs text-muted-foreground">{summary.totalCount} transactions</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold">{summary.completedCount}</h4>
            <p className="text-xs text-muted-foreground">
              {summary.totalCount > 0 
                ? `${Math.round((summary.completedCount / summary.totalCount) * 100)}%`
                : '0%'} of total
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold">{summary.pendingCount}</h4>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <ArrowUp className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Largest</p>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold">{formatCurrency(summary.largestTransaction)}</h4>
            <p className="text-xs text-muted-foreground">Highest transaction</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummaryCards;
