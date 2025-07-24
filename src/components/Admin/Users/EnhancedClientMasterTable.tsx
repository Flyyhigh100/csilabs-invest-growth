import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, ArrowUpDown, ArrowUp, ArrowDown, Download, 
  User, Mail, Phone, MapPin, Wallet, Calendar,
  TrendingUp, DollarSign, Clock, AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { useEnhancedClientData, EnhancedClientData } from '@/hooks/admin/useEnhancedClientData';
import { TestIconLucide } from '@/components/icons/TestIcon';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EnhancedFilters, { EnhancedFilters as FilterType } from './filters/EnhancedFilters';
import { useEnhancedClientFiltering } from '@/hooks/admin/useEnhancedClientFiltering';

interface EnhancedClientMasterTableProps {
  onViewDetails: (client: EnhancedClientData) => void;
  searchQuery: string;
}

type SortKey = keyof EnhancedClientData;
type SortDirection = 'asc' | 'desc';

const EnhancedClientMasterTable: React.FC<EnhancedClientMasterTableProps> = ({
  onViewDetails,
  searchQuery
}) => {
  const { data: clients = [], isLoading, error, refetch } = useEnhancedClientData();
  
  // Enhanced filters state
  const [filters, setFilters] = useState<FilterType>({
    searchQuery: searchQuery || '',
    dateRange: undefined, // Default to "All Time"
    kycStatus: 'all',
    accountStatus: 'all',
    investmentRange: 'all',
    tokenRange: 'all',
    network: 'all',
    transactionActivity: 'all',
  });

  // Update search query from props
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, searchQuery: searchQuery || '' }));
  }, [searchQuery]);
  
  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('total_tokens_sent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle column sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to desc for most meaningful data first
    }
  };

  // Apply enhanced filtering
  const filteredClients = useEnhancedClientFiltering(clients, filters);

  // Apply sorting to filtered clients
  const processedClients = useMemo(() => {
    return filteredClients.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = sortDirection === 'asc' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
      if (bValue === null || bValue === undefined) bValue = sortDirection === 'asc' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

      // Convert to numbers for numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [filteredClients, sortKey, sortDirection]);

  // Render sort header
  const SortHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode; className?: string }> = ({ 
    sortKey: key, 
    children, 
    className = "" 
  }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortKey === key ? (
          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </TableHead>
  );

  // Render KYC status badge
  const renderKycBadge = (status: string | null, hasRecord: boolean) => {
    if (!hasRecord) {
      return <Badge variant="outline" className="text-gray-500">No KYC</Badge>;
    }
    
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'needs_clarification':
        return <Badge className="bg-blue-100 text-blue-800">Clarification</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Render wallet addresses
  const renderWallets = (polygonAddress: string | null, solanaAddress: string | null) => {
    if (!polygonAddress && !solanaAddress) {
      return <span className="text-gray-400 text-xs">No wallet</span>;
    }

    return (
      <div className="space-y-1">
        {polygonAddress && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">POL</Badge>
            <span className="font-mono text-xs">{polygonAddress.slice(0, 6)}...{polygonAddress.slice(-4)}</span>
            <CopyButton value={polygonAddress} variant="ghost" size="sm" className="h-4 w-4 p-0" />
          </div>
        )}
        {solanaAddress && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">SOL</Badge>
            <span className="font-mono text-xs">{solanaAddress.slice(0, 6)}...{solanaAddress.slice(-4)}</span>
            <CopyButton value={solanaAddress} variant="ghost" size="sm" className="h-4 w-4 p-0" />
          </div>
        )}
      </div>
    );
  };

  // Export to CSV function with current filters
  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Address', 'KYC Status', 'Total Tokens Sent', 
      'Total Invested', 'Completed Value', 'Pending Value', 'Avg Token Price',
      'Last Transaction', 'Member Since', 'Polygon Wallet', 'Solana Wallet'
    ];

    const csvData = processedClients.map(client => [
      `${client.first_name || ''} ${client.last_name || ''}`.trim(),
      client.email || '',
      client.phone_number || '',
      `${client.street_address || ''} ${client.city || ''} ${client.state_province || ''} ${client.postal_code || ''}`.trim(),
      client.kyc_status || 'No KYC',
      client.total_tokens_sent.toString(),
      client.total_invested.toString(),
      client.completed_value.toString(),
      client.pending_value.toString(),
      client.average_token_price.toString(),
      client.last_transaction_date ? new Date(client.last_transaction_date).toLocaleDateString() : '',
      new Date(client.created_at).toLocaleDateString(),
      client.wallet_address || '',
      client.solana_wallet_address || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterSuffix = Object.values(filters).some(v => v !== '' && v !== 'all' && v !== undefined) ? '-filtered' : '';
    link.download = `client-master-list${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading enhanced client data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading client data: {(error as Error).message}
            <Button onClick={() => refetch()} variant="outline" className="ml-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Filters */}
      <EnhancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={exportToCSV}
        totalResults={clients.length}
        filteredResults={processedClients.length}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-xl font-bold">{processedClients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Tokens Sent</p>
                <p className="text-xl font-bold">
                  {processedClients.reduce((sum, client) => sum + client.total_tokens_sent, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-xl font-bold">
                  {formatCurrency(processedClients.reduce((sum, client) => sum + client.completed_value, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Tokens Pending</p>
                <p className="text-xl font-bold">
                  {processedClients.reduce((sum, client) => sum + client.tokens_pending_delivery, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Client Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Master List - Complete Data for CEO Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader sortKey="first_name" className="min-w-[150px]">
                    <User className="h-4 w-4" />
                    Name
                  </SortHeader>
                  <SortHeader sortKey="email" className="min-w-[200px]">
                    <Mail className="h-4 w-4" />
                    Contact
                  </SortHeader>
                  <TableHead className="min-w-[180px]">
                    <MapPin className="h-4 w-4" />
                    Address
                  </TableHead>
                  <SortHeader sortKey="kyc_status">
                    KYC
                  </SortHeader>
                  <TableHead className="min-w-[160px]">
                    <Wallet className="h-4 w-4" />
                    Wallets
                  </TableHead>
                  <SortHeader sortKey="total_tokens_sent" className="min-w-[120px] text-center">
                    <TrendingUp className="h-4 w-4" />
                    Tokens Sent
                  </SortHeader>
                  <SortHeader sortKey="completed_value" className="min-w-[120px] text-center">
                    <DollarSign className="h-4 w-4" />
                    Invested
                  </SortHeader>
                  <SortHeader sortKey="pending_value" className="min-w-[120px] text-center">
                    <Clock className="h-4 w-4" />
                    Pending
                  </SortHeader>
                  <SortHeader sortKey="average_token_price" className="min-w-[100px] text-center">
                    Avg Price
                  </SortHeader>
                  <SortHeader sortKey="last_transaction_date" className="min-w-[120px]">
                    <Calendar className="h-4 w-4" />
                    Last Tx
                  </SortHeader>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">
                            {client.first_name || client.last_name 
                              ? `${client.first_name || ''} ${client.last_name || ''}`.trim()
                              : 'Unnamed User'
                            }
                          </p>
                          <p className="text-xs text-gray-500">ID: {client.id.slice(0, 8)}</p>
                        </div>
                        {client.has_test_data && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <TestIconLucide className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>Has test data</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{client.email || 'No email'}</p>
                        <p className="text-xs text-gray-500">{client.phone_number || 'No phone'}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-xs text-gray-600">
                        {client.street_address && <p>{client.street_address}</p>}
                        {(client.city || client.state_province) && (
                          <p>{client.city}{client.city && client.state_province ? ', ' : ''}{client.state_province}</p>
                        )}
                        {client.postal_code && <p>{client.postal_code}</p>}
                        {!client.street_address && !client.city && !client.state_province && !client.postal_code && (
                          <span className="text-gray-400">No address</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {renderKycBadge(client.kyc_status, client.has_kyc_record)}
                    </TableCell>
                    
                    <TableCell>
                      {renderWallets(client.wallet_address, client.solana_wallet_address)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div>
                        <p className="font-bold text-green-600">
                          {client.total_tokens_sent.toLocaleString()}
                        </p>
                        {client.tokens_pending_delivery > 0 && (
                          <p className="text-xs text-orange-600">
                            +{client.tokens_pending_delivery.toLocaleString()} pending
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <p className="font-medium">{formatCurrency(client.completed_value)}</p>
                      {client.total_transactions > client.completed_transactions && (
                        <p className="text-xs text-gray-500">
                          {client.completed_transactions}/{client.total_transactions} completed
                        </p>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {client.pending_value > 0 ? (
                        <p className="text-orange-600 font-medium">{formatCurrency(client.pending_value)}</p>
                      ) : (
                        <p className="text-gray-400">$0</p>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {client.average_token_price > 0 ? (
                        <p className="text-sm">${client.average_token_price.toFixed(4)}</p>
                      ) : (
                        <p className="text-gray-400">-</p>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {client.last_transaction_date ? (
                        <div className="text-xs">
                          <p>{new Date(client.last_transaction_date).toLocaleDateString()}</p>
                          <p className="text-gray-500">{new Date(client.last_transaction_date).toLocaleTimeString()}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs">No transactions</p>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(client)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {processedClients.length === 0 && searchQuery && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No clients found matching "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedClientMasterTable;