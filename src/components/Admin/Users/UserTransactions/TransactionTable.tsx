
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TestIconLucide } from '@/components/icons/TestIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TransactionTableProps {
  transactions: any[];
  isLoading: boolean;
  onSelectTransaction: (transaction: any) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  isLoading, 
  onSelectTransaction 
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const renderStatusBadge = (status: string, isTest: boolean) => {
    // Special badge for test transactions
    if (isTest) {
      return (
        <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <TestIconLucide className="h-3 w-3" />
          Test {status || 'Unknown'}
        </Badge>
      );
    }
    
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-green-100 text-green-800">
                  Completed ✓
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Counts toward real value</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const isCompleted = transaction.status?.toLowerCase() === 'completed';
              const isRealValue = isCompleted && !transaction.is_test;
              
              return (
                <TableRow key={transaction.id} className={isRealValue ? 'bg-green-50' : undefined}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-1">
                      {transaction.id.substring(0, 8)}...
                      {transaction.is_test && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <TestIconLucide className="h-3.5 w-3.5 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Test transaction (excluded from real volume)
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>
                    <div className={transaction.is_test ? "text-amber-600" : isCompleted ? "text-green-600 font-medium" : ""}>
                      ${(transaction.amount || 0).toFixed(2)}
                      {isRealValue && (
                        <div className="text-xs text-green-600">Real value</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStatusBadge(transaction.status, transaction.is_test)}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.payment_method || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
