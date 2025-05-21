
import React, { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FilterX, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactionManager } from '@/hooks/admin/useTransactionManager';
import TransactionStatusTable from './TransactionStatusTable';
import CleanupPendingTransactionsCard from './CleanupPendingTransactionsCard';
import StatusSyncCard from './StatusSyncCard';

const TransactionStatusDashboard = () => {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('coinpayments');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [olderThan, setOlderThan] = useState<number>(7);
  const [includeTestData, setIncludeTestData] = useState<boolean>(false);

  const {
    transactions,
    isLoading,
    error,
    refetch,
    cleanupOldPendingTransactions,
    isCleaningUp,
    updateTransactionStatus,
  } = useTransactionManager({
    status: statusFilter || undefined,
    paymentMethod: paymentMethodFilter || undefined,
    startDate,
    endDate,
    searchQuery,
    includeTestData,
    olderThanDays: olderThan,
  });

  const handleResetFilters = () => {
    setStatusFilter('pending');
    setPaymentMethodFilter('coinpayments');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CleanupPendingTransactionsCard
          onCleanup={cleanupOldPendingTransactions}
          isLoading={isCleaningUp}
          olderThan={olderThan}
          setOlderThan={setOlderThan}
        />
        <StatusSyncCard onSync={refetch} />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Transaction Status Manager</CardTitle>
              <CardDescription>
                Review and update transaction status for all payment methods
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="include-test-data" className="text-sm font-medium">
                Include test data
              </Label>
              <Switch
                id="include-test-data"
                checked={includeTestData}
                onCheckedChange={setIncludeTestData}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="payment-method-filter">Payment Method</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger id="payment-method-filter">
                  <SelectValue placeholder="Filter by payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Payment Methods</SelectItem>
                  <SelectItem value="coinpayments">CoinPayments</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                type="search"
                placeholder="Search by transaction ID, wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleResetFilters}>
              <FilterX className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load transactions'}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilter && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
                <button 
                  className="ml-1 hover:bg-gray-200 rounded-full"
                  onClick={() => setStatusFilter('')}
                >
                  ✕
                </button>
              </Badge>
            )}
            {paymentMethodFilter && (
              <Badge variant="secondary" className="gap-1">
                Payment: {paymentMethodFilter}
                <button 
                  className="ml-1 hover:bg-gray-200 rounded-full"
                  onClick={() => setPaymentMethodFilter('')}
                >
                  ✕
                </button>
              </Badge>
            )}
            {startDate && (
              <Badge variant="secondary" className="gap-1">
                From: {format(startDate, 'MMM d, yyyy')}
                <button 
                  className="ml-1 hover:bg-gray-200 rounded-full"
                  onClick={() => setStartDate(undefined)}
                >
                  ✕
                </button>
              </Badge>
            )}
            {endDate && (
              <Badge variant="secondary" className="gap-1">
                To: {format(endDate, 'MMM d, yyyy')}
                <button 
                  className="ml-1 hover:bg-gray-200 rounded-full"
                  onClick={() => setEndDate(undefined)}
                >
                  ✕
                </button>
              </Badge>
            )}
          </div>
          
          {/* Transactions table */}
          <TransactionStatusTable
            transactions={transactions || []}
            isLoading={isLoading}
            onUpdateStatus={updateTransactionStatus}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionStatusDashboard;
