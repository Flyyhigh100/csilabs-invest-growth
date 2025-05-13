import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTransactionAnalytics } from '@/hooks/admin/useTransactionAnalytics';
import TestDataToggle from '@/components/Admin/TestDataToggle';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import TransactionAnalyticsFilter from '@/components/Admin/Analytics/TransactionAnalyticsFilter';
import { formatCurrency } from '@/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, TrendingUp, CreditCard, Calendar, ChevronDown, ChevronUp, Download } from 'lucide-react';
import TransactionTable from '@/components/Admin/Users/UserTransactions/TransactionTable';
import { Button } from '@/components/ui/button';
import { exportTransactionsToCSV } from '@/utils/admin/transactions/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5733', '#C70039'];

const TransactionAnalyticsPage = () => {
  // Set default date range to start from March 1, 2025 (project start)
  const projectStartDate = new Date(2025, 2, 1); // March 1, 2025
  
  const [filterParams, setFilterParams] = useState({
    startDate: projectStartDate,
    endDate: null,
    status: '',
    paymentMethod: '',
    minAmount: undefined,
    maxAmount: undefined,
  });

  // Handle breadcrumb source (whether we came from volume, completed transactions, etc.)
  const [breadcrumbSource, setBreadcrumbSource] = useState('dashboard');
  
  // State for transaction table visibility
  const [showTransactionTable, setShowTransactionTable] = useState(false);
  
  // State for the selected transaction in the table
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Process URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    
    console.log('Transaction Analytics loaded with source:', source);
    
    if (source) {
      setBreadcrumbSource(source);
      
      // Apply filters based on the source
      if (source === 'volume') {
        // Don't apply any special filters for volume - we want to see all transactions
        console.log('Volume source detected - showing all completed transactions');
        setFilterParams(prev => ({ ...prev, status: '', startDate: projectStartDate }));
      } else if (source === 'completed') {
        console.log('Completed source detected - filtering by completed status');
        setFilterParams(prev => ({ ...prev, status: 'completed', startDate: projectStartDate }));
      }
    }
  }, []);

  const { 
    data,
    isLoading,
    includeTestData,
    setIncludeTestData,
    rawTransactions
  } = useTransactionAnalytics(filterParams);

  // Log debug information about the data we're working with
  useEffect(() => {
    if (!isLoading && data) {
      console.log('Transaction Analytics Data:', { 
        totalVolume: data.totalVolume,
        transactionCount: data.transactionCount,
        includesTestData: includeTestData,
        appliedFilters: filterParams,
        startDate: filterParams.startDate?.toISOString(),
        rawTransactionCount: rawTransactions?.length || 0
      });
    }
  }, [isLoading, data, includeTestData, filterParams, rawTransactions]);

  const handleFilterChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    
    // Ensure we never filter before project start date (March 1, 2025)
    const adjustedFilters = { ...newFilters };
    
    if (adjustedFilters.startDate && adjustedFilters.startDate < projectStartDate) {
      adjustedFilters.startDate = projectStartDate;
    }
    
    setFilterParams(prev => ({ ...prev, ...adjustedFilters }));
  };

  const getBreadcrumbText = () => {
    switch (breadcrumbSource) {
      case 'volume':
        return 'Transaction Volume';
      case 'completed':
        return 'Completed Transactions';
      default:
        return 'Transaction Analytics';
    }
  };

  const handleExportCSV = () => {
    if (!rawTransactions || rawTransactions.length === 0) {
      console.log('No transactions to export');
      return;
    }
    
    console.log(`Exporting ${rawTransactions.length} transactions to CSV`);
    exportTransactionsToCSV(rawTransactions);
  };

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    // We could use this for a transaction detail view in the future
    console.log('Selected transaction:', transaction);
  };

  const toggleTransactionTable = () => {
    setShowTransactionTable(prevState => !prevState);
  };

  return (
    <AdminLayout title="Transaction Analytics">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{getBreadcrumbText()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Date Range Note */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Analytics data starts from project launch in March 2025.
        </p>
      </div>
      
      {/* Toggle and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <TransactionAnalyticsFilter onFilterChange={handleFilterChange} defaultStartDate={projectStartDate} />
        <TestDataToggle 
          checked={includeTestData} 
          onCheckedChange={setIncludeTestData} 
          showAlert 
          compact 
          className="self-end"
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Total Volume</p>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-bold">
                {isLoading ? '...' : formatCurrency(data?.totalVolume || 0)}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isLoading ? '...' : `${data?.transactionCount || 0} transactions`}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Average Transaction</p>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-bold">
                {isLoading ? '...' : formatCurrency(data?.averageTransaction || 0)}
              </h4>
              <p className="text-xs text-muted-foreground">per transaction</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Preferred Method</p>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-bold capitalize">
                {isLoading ? '...' : data?.preferredMethod || 'None'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isLoading ? '...' : `${data?.preferredMethodPercentage || 0}% of transactions`}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Best Day</p>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-bold">
                {isLoading ? '...' : data?.bestDay || 'N/A'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isLoading ? '...' : formatCurrency(data?.bestDayVolume || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="volume" className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="volume">Volume Over Time</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="status">Transaction Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="volume" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.volumeOverTime || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => {
                        // Handle the case where value might be an array
                        const actualValue = Array.isArray(value) ? value[0] : value;
                        return formatCurrency(actualValue as number);
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="methods" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.paymentMethods || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(data?.paymentMethods || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => {
                        // Handle the case where value might be an array
                        const actualValue = Array.isArray(value) ? value[0] : value;
                        return [formatCurrency(actualValue as number), ""];
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.statusBreakdown || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                    <Bar dataKey="count">
                      {(data?.statusBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Transaction Data Section - New Addition */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Transaction Data</h2>
            {!isLoading && rawTransactions && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({rawTransactions.length} transactions)
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleTransactionTable}
              className="flex items-center gap-1"
            >
              {showTransactionTable ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Transactions
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Transactions
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              className="flex items-center gap-1"
              disabled={isLoading || !rawTransactions || rawTransactions.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        {/* Filter summary */}
        <div className="text-sm text-muted-foreground mb-3">
          <p>
            Applied filters: 
            {filterParams.startDate && (
              <span className="ml-1">
                date from {filterParams.startDate.toLocaleDateString()}
                {filterParams.endDate ? ` to ${filterParams.endDate.toLocaleDateString()}` : ''}
              </span>
            )}
            {filterParams.status && <span className="ml-1">status: {filterParams.status}</span>}
            {filterParams.paymentMethod && <span className="ml-1">method: {filterParams.paymentMethod}</span>}
            {(filterParams.minAmount !== undefined || filterParams.maxAmount !== undefined) && (
              <span className="ml-1">
                amount: 
                {filterParams.minAmount !== undefined ? ` min $${filterParams.minAmount}` : ''}
                {filterParams.maxAmount !== undefined ? ` max $${filterParams.maxAmount}` : ''}
              </span>
            )}
            {!filterParams.status && !filterParams.paymentMethod && 
             filterParams.minAmount === undefined && filterParams.maxAmount === undefined && (
              <span className="ml-1">showing all transactions</span>
            )}
          </p>
        </div>

        {showTransactionTable && (
          <div className="border rounded-md">
            <TransactionTable 
              transactions={rawTransactions || []}
              isLoading={isLoading}
              onSelectTransaction={handleSelectTransaction}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TransactionAnalyticsPage;
