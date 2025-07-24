import { useMemo } from 'react';
import { EnhancedClientData } from './useEnhancedClientData';
import { EnhancedFilters } from '@/components/Admin/Users/filters/EnhancedFilters';
import { isWithinInterval, subDays } from 'date-fns';

export const useEnhancedClientFiltering = (
  clients: EnhancedClientData[],
  filters: EnhancedFilters
) => {
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(client => {
        const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim().toLowerCase();
        const address = `${client.street_address || ''} ${client.city || ''} ${client.state_province || ''} ${client.postal_code || ''}`.trim().toLowerCase();
        
        return (
          fullName.includes(query) ||
          (client.email?.toLowerCase().includes(query)) ||
          (client.phone_number?.toLowerCase().includes(query)) ||
          (client.wallet_address?.toLowerCase().includes(query)) ||
          (client.solana_wallet_address?.toLowerCase().includes(query)) ||
          address.includes(query)
        );
      });
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(client => {
        const clientDate = new Date(client.created_at);
        
        if (filters.dateRange?.from && filters.dateRange?.to) {
          return isWithinInterval(clientDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          });
        }
        
        if (filters.dateRange?.from) {
          return clientDate >= filters.dateRange.from;
        }
        
        if (filters.dateRange?.to) {
          return clientDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }

    // KYC Status filter
    if (filters.kycStatus !== 'all') {
      filtered = filtered.filter(client => {
        if (filters.kycStatus === 'no_kyc') {
          return !client.has_kyc_record;
        }
        return client.kyc_status === filters.kycStatus;
      });
    }

    // Account Status filter
    if (filters.accountStatus !== 'all') {
      filtered = filtered.filter(client => {
        switch (filters.accountStatus) {
          case 'test_data':
            return client.has_test_data;
          case 'active':
            return !client.has_test_data && client.total_transactions > 0;
          case 'inactive':
            return !client.has_test_data && client.total_transactions === 0;
          default:
            return true;
        }
      });
    }

    // Investment Range filter
    if (filters.investmentRange !== 'all') {
      filtered = filtered.filter(client => {
        const invested = client.completed_value;
        
        switch (filters.investmentRange) {
          case '0-1000':
            return invested >= 0 && invested <= 1000;
          case '1000-5000':
            return invested > 1000 && invested <= 5000;
          case '5000-10000':
            return invested > 5000 && invested <= 10000;
          case '10000-25000':
            return invested > 10000 && invested <= 25000;
          case '25000-50000':
            return invested > 25000 && invested <= 50000;
          case '50000+':
            return invested > 50000;
          case '10000+': // For quick filter
            return invested > 10000;
          case '25000+': // For VIP quick filter
            return invested > 25000;
          default:
            return true;
        }
      });
    }

    // Token Range filter
    if (filters.tokenRange !== 'all') {
      filtered = filtered.filter(client => {
        const tokens = client.total_tokens_sent;
        
        switch (filters.tokenRange) {
          case '0-1000':
            return tokens >= 0 && tokens <= 1000;
          case '1000-5000':
            return tokens > 1000 && tokens <= 5000;
          case '5000-10000':
            return tokens > 5000 && tokens <= 10000;
          case '10000-25000':
            return tokens > 10000 && tokens <= 25000;
          case '25000-50000':
            return tokens > 25000 && tokens <= 50000;
          case '50000+':
            return tokens > 50000;
          case '10000+': // For quick filter
            return tokens > 10000;
          default:
            return true;
        }
      });
    }

    // Network filter
    if (filters.network !== 'all') {
      filtered = filtered.filter(client => {
        const hasPolygon = Boolean(client.wallet_address);
        const hasSolana = Boolean(client.solana_wallet_address);
        
        switch (filters.network) {
          case 'polygon':
            return hasPolygon && !hasSolana;
          case 'solana':
            return hasSolana && !hasPolygon;
          case 'both':
            return hasPolygon && hasSolana;
          case 'neither':
            return !hasPolygon && !hasSolana;
          default:
            return true;
        }
      });
    }

    // Transaction Activity filter
    if (filters.transactionActivity !== 'all') {
      filtered = filtered.filter(client => {
        const hasTransactions = client.total_transactions > 0;
        const hasRecentActivity = client.last_transaction_date && 
          isWithinInterval(new Date(client.last_transaction_date), {
            start: subDays(new Date(), 30),
            end: new Date()
          });
        
        switch (filters.transactionActivity) {
          case 'has_transactions':
            return hasTransactions;
          case 'no_transactions':
            return !hasTransactions;
          case 'recent_activity':
            return hasRecentActivity;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [clients, filters]);

  return filteredClients;
};