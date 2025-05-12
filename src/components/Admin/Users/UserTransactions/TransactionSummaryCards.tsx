
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ArrowUp, CheckCircle, Clock, BeakerIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { UserTransactionSummary } from '@/hooks/admin/useUserTransactions';
import { TestIconLucide } from '@/components/icons/TestIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-xs font-medium text-green-600">Real Value*</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Completed, non-test transactions only</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold text-green-600">{formatCurrency(summary.completedValue)}</h4>
            <p className="text-xs text-muted-foreground">
              {summary.completedCount} completed transactions
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
            <h4 className="text-lg font-bold">{formatCurrency(summary.pendingValue)}</h4>
            <p className="text-xs text-muted-foreground">
              {summary.pendingCount} pending transactions
            </p>
          </div>
        </CardContent>
      </Card>
      
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
            <p className="text-xs text-muted-foreground">{summary.totalCount} total transactions</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <TestIconLucide className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Test Data</p>
          </div>
          <div className="mt-3">
            <h4 className="text-lg font-bold text-amber-600">{formatCurrency(summary.testValue)}</h4>
            <p className="text-xs text-muted-foreground">
              {summary.testCount} test transactions
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="col-span-full mt-1 text-xs text-muted-foreground">
        <span className="text-green-600 font-medium">*Real Value:</span> Only includes completed, non-test transactions
      </div>
    </div>
  );
};

export default TransactionSummaryCards;
