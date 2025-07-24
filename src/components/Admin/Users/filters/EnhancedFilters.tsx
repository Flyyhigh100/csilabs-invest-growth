import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, DollarSign, Shield, Users, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface EnhancedFilters {
  searchQuery: string;
  dateRange: DateRange | undefined;
  kycStatus: string;
  accountStatus: string;
  investmentRange: string;
  tokenRange: string;
  network: string;
  transactionActivity: string;
}

interface EnhancedFiltersProps {
  filters: EnhancedFilters;
  onFiltersChange: (filters: EnhancedFilters) => void;
  onExport: () => void;
  isExporting?: boolean;
  totalResults: number;
  filteredResults: number;
}

const INVESTMENT_RANGES = [
  { value: 'all', label: 'All Investment Ranges' },
  { value: '0-1000', label: '$0 - $1,000' },
  { value: '1000-5000', label: '$1,000 - $5,000' },
  { value: '5000-10000', label: '$5,000 - $10,000' },
  { value: '10000-25000', label: '$10,000 - $25,000' },
  { value: '25000-50000', label: '$25,000 - $50,000' },
  { value: '50000+', label: '$50,000+' },
];

const TOKEN_RANGES = [
  { value: 'all', label: 'All Token Ranges' },
  { value: '0-1000', label: '0 - 1,000 tokens' },
  { value: '1000-5000', label: '1,000 - 5,000 tokens' },
  { value: '5000-10000', label: '5,000 - 10,000 tokens' },
  { value: '10000-25000', label: '10,000 - 25,000 tokens' },
  { value: '25000-50000', label: '25,000 - 50,000 tokens' },
  { value: '50000+', label: '50,000+ tokens' },
];

const KYC_STATUSES = [
  { value: 'all', label: 'All KYC Status' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'needs_clarification', label: 'Needs Clarification' },
  { value: 'no_kyc', label: 'No KYC' },
];

const ACCOUNT_STATUSES = [
  { value: 'all', label: 'All Accounts' },
  { value: 'active', label: 'Active' },
  { value: 'test_data', label: 'Test Data' },
  { value: 'inactive', label: 'Inactive' },
];

const NETWORKS = [
  { value: 'all', label: 'All Networks' },
  { value: 'polygon', label: 'Polygon Only' },
  { value: 'solana', label: 'Solana Only' },
  { value: 'both', label: 'Both Networks' },
  { value: 'neither', label: 'No Wallet' },
];

const TRANSACTION_ACTIVITY = [
  { value: 'all', label: 'All Activity' },
  { value: 'has_transactions', label: 'Has Transactions' },
  { value: 'no_transactions', label: 'No Transactions' },
  { value: 'recent_activity', label: 'Recent Activity (30 days)' },
];

const QUICK_FILTERS = [
  { key: 'high_value', label: 'High-Value Clients', icon: DollarSign, description: '>$10K invested' },
  { key: 'vip', label: 'VIP Clients', icon: TrendingUp, description: '>$25K invested' },
  { key: 'pending_kyc', label: 'Pending KYC', icon: Shield, description: 'Needs approval' },
  { key: 'large_holders', label: 'Large Token Holders', icon: Users, description: '>10K tokens' },
  { key: 'recent_tx', label: 'Recent Transactions', icon: Calendar, description: 'Last 30 days' },
  { key: 'incomplete', label: 'Incomplete Profiles', icon: Users, description: 'Missing info' },
];

const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  isExporting = false,
  totalResults,
  filteredResults
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const updateFilter = (key: keyof EnhancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      dateRange: undefined,
      kycStatus: 'all',
      accountStatus: 'all',
      investmentRange: 'all',
      tokenRange: 'all',
      network: 'all',
      transactionActivity: 'all',
    });
    setActiveQuickFilter(null);
  };

  const handleQuickFilter = (filterKey: string) => {
    setActiveQuickFilter(activeQuickFilter === filterKey ? null : filterKey);
    
    // Apply the quick filter logic
    switch (filterKey) {
      case 'high_value':
        updateFilter('investmentRange', '10000+');
        break;
      case 'vip':
        updateFilter('investmentRange', '25000+');
        break;
      case 'pending_kyc':
        updateFilter('kycStatus', 'pending');
        break;
      case 'large_holders':
        updateFilter('tokenRange', '10000+');
        break;
      case 'recent_tx':
        updateFilter('transactionActivity', 'recent_activity');
        break;
      case 'incomplete':
        updateFilter('accountStatus', 'incomplete');
        break;
    }
  };

  const hasActiveFilters = () => {
    return filters.searchQuery !== '' ||
           filters.dateRange !== undefined ||
           filters.kycStatus !== 'all' ||
           filters.accountStatus !== 'all' ||
           filters.investmentRange !== 'all' ||
           filters.tokenRange !== 'all' ||
           filters.network !== 'all' ||
           filters.transactionActivity !== 'all';
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar and Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Enhanced Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, phone, address, or wallet..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter(v => v !== '' && v !== 'all' && v !== undefined).length}
                </Badge>
              )}
            </Button>
            
            {hasActiveFilters() && (
              <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((quickFilter) => {
            const Icon = quickFilter.icon;
            const isActive = activeQuickFilter === quickFilter.key;
            
            return (
              <Button
                key={quickFilter.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(quickFilter.key)}
                className="flex items-center gap-2"
              >
                <Icon className="h-3 w-3" />
                {quickFilter.label}
              </Button>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="space-y-4">
            {/* Primary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(range) => updateFilter('dateRange', range)}
                  className="w-full"
                />
              </div>

              {/* KYC Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">KYC Status</label>
                <Select value={filters.kycStatus} onValueChange={(value) => updateFilter('kycStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KYC_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Status</label>
                <Select value={filters.accountStatus} onValueChange={(value) => updateFilter('accountStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <Select value={filters.network} onValueChange={(value) => updateFilter('network', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map(network => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Secondary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Investment Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Range</label>
                <Select value={filters.investmentRange} onValueChange={(value) => updateFilter('investmentRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Token Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Token Range</label>
                <Select value={filters.tokenRange} onValueChange={(value) => updateFilter('tokenRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKEN_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Activity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Activity</label>
                <Select value={filters.transactionActivity} onValueChange={(value) => updateFilter('transactionActivity', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_ACTIVITY.map(activity => (
                      <SelectItem key={activity.value} value={activity.value}>
                        {activity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {filteredResults.toLocaleString()} of {totalResults.toLocaleString()} clients
            {hasActiveFilters() && (
              <Badge variant="outline" className="ml-2">
                Filtered
              </Badge>
            )}
          </div>
          
          {filters.dateRange === undefined && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>All Time Data</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFilters;