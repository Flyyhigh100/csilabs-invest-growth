import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Users,
  Star,
  DollarSign,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { useClientSearch } from '@/hooks/admin/usePaginatedClients';
import { formatCurrency } from '@/utils/format';

const EnhancedClientList: React.FC = () => {
  const {
    searchOptions,
    updateSearchOptions,
    resetFilters,
    data: paginatedResponse,
    isLoading,
    error,
    refetch
  } = useClientSearch();

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    updateSearchOptions({ searchQuery: query });
  };

  const handleSort = (sortBy: 'name' | 'created_at' | 'total_value' | 'last_transaction') => {
    const newOrder = searchOptions.sortBy === sortBy && searchOptions.sortOrder === 'desc' ? 'asc' : 'desc';
    updateSearchOptions({ sortBy, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchOptions({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    updateSearchOptions({ pageSize: parseInt(newPageSize), page: 1 });
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...searchOptions.filters };
    if (value === 'all' || value === '') {
      delete newFilters[filterKey as keyof typeof newFilters];
    } else {
      (newFilters as any)[filterKey] = value === 'true' ? true : value === 'false' ? false : value;
    }
    updateSearchOptions({ filters: newFilters });
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    if (!paginatedResponse?.data) return;
    
    const headers = ['Name', 'Email', 'Status', 'KYC Status', 'Total Transactions', 'Completed Value', 'Created At'];
    const csvData = paginatedResponse.data.map(client => [
      `${client.first_name} ${client.last_name}`,
      client.email,
      client.status,
      client.kyc_status,
      client.total_transactions,
      client.completed_value,
      new Date(client.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading clients: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enhanced Client Management
              </CardTitle>
              <CardDescription>
                {paginatedResponse ? 
                  `${paginatedResponse.totalCount} total clients • Page ${paginatedResponse.currentPage} of ${paginatedResponse.totalPages}` :
                  'Loading client data...'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={!paginatedResponse?.data?.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchOptions.searchQuery || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={searchOptions.pageSize.toString()} 
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select 
                  value={searchOptions.filters?.status || 'all'} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">KYC Status</label>
                <Select 
                  value={searchOptions.filters?.kyc_status || 'all'} 
                  onValueChange={(value) => handleFilterChange('kyc_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All KYC Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Transaction Activity</label>
                <Select 
                  value={searchOptions.filters?.has_transactions?.toString() || 'all'} 
                  onValueChange={(value) => handleFilterChange('has_transactions', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="true">Has Transactions</SelectItem>
                    <SelectItem value="false">No Transactions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">VIP Status</label>
                <Select 
                  value={searchOptions.filters?.is_vip?.toString() || 'all'} 
                  onValueChange={(value) => handleFilterChange('is_vip', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="true">VIP Only</SelectItem>
                    <SelectItem value="false">Standard Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <Button variant="outline" onClick={resetFilters} size="sm">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
            <button
              className="text-left flex items-center gap-1 hover:text-primary"
              onClick={() => handleSort('name')}
            >
              Name <ArrowUpDown className="h-3 w-3" />
            </button>
            <div>Email</div>
            <div>Status</div>
            <div>KYC</div>
            <button
              className="text-left flex items-center gap-1 hover:text-primary"
              onClick={() => handleSort('total_value')}
            >
              Total Value <ArrowUpDown className="h-3 w-3" />
            </button>
            <div>Transactions</div>
            <button
              className="text-left flex items-center gap-1 hover:text-primary"
              onClick={() => handleSort('last_transaction')}
            >
              Last Activity <ArrowUpDown className="h-3 w-3" />
            </button>
            <button
              className="text-left flex items-center gap-1 hover:text-primary"
              onClick={() => handleSort('created_at')}
            >
              Joined <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4 items-center">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : paginatedResponse?.data?.length ? (
            <div className="divide-y">
              {paginatedResponse.data.map((client) => (
                <div key={client.id} className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {client.first_name} {client.last_name}
                    </span>
                    {client.is_vip && <Star className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {client.email}
                  </div>
                  <div>{getStatusBadge(client.status)}</div>
                  <div>{getKycBadge(client.kyc_status)}</div>
                  <div className="font-medium">
                    {formatCurrency(client.completed_value)}
                  </div>
                  <div className="text-center">
                    <span className="font-medium">{client.completed_transactions}</span>
                    <span className="text-muted-foreground">/{client.total_transactions}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {client.last_transaction_date 
                      ? new Date(client.last_transaction_date).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No clients found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {paginatedResponse && paginatedResponse.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((paginatedResponse.currentPage - 1) * searchOptions.pageSize) + 1} to{' '}
                {Math.min(paginatedResponse.currentPage * searchOptions.pageSize, paginatedResponse.totalCount)} of{' '}
                {paginatedResponse.totalCount} clients
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginatedResponse.currentPage - 1)}
                  disabled={!paginatedResponse.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {paginatedResponse.currentPage} of {paginatedResponse.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginatedResponse.currentPage + 1)}
                  disabled={!paginatedResponse.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedClientList;