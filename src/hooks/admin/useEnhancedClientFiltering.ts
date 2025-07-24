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
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(client => {
        const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = (client.phone_number || '').toLowerCase();
        const walletAddress = (client.wallet_address || '').toLowerCase();
        const solanaWallet = (client.solana_wallet_address || '').toLowerCase();
        const address = (client.street_address || '').toLowerCase();
        
        return fullName.includes(query) ||
               email.includes(query) ||
               phone.includes(query) ||
               walletAddress.includes(query) ||
               solanaWallet.includes(query) ||
               address.includes(query);
      });
    }

    // Date Range filter
    if (filters.dateRange && filters.dateRange.from) {
      filtered = filtered.filter(client => {
        const clientDate = new Date(client.created_at);
        const fromDate = filters.dateRange!.from!;
        const toDate = filters.dateRange!.to || new Date();
        
        return isWithinInterval(clientDate, {
          start: fromDate,
          end: toDate
        });
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
          case 'active':
            return !client.has_test_data;
          case 'test_data':
            return client.has_test_data;
          case 'inactive':
            // Define inactive criteria (e.g., no recent activity)
            return false; // Placeholder logic
          case 'incomplete_profile':
            // Check for missing key information
            return !client.first_name || 
                   !client.last_name || 
                   !client.email || 
                   !client.phone_number || 
                   !client.street_address ||
                   (!client.wallet_address && !client.solana_wallet_address);
          default:
            return true;
        }
      });
    }

    // Investment Range filter
    if (filters.investmentRange !== 'all') {
      filtered = filtered.filter(client => {
        const investment = client.completed_value || 0;
        
        switch (filters.investmentRange) {
          case '0-100':
            return investment >= 0 && investment <= 100;
          case '100-200':
            return investment > 100 && investment <= 200;
          case '200-500':
            return investment > 200 && investment <= 500;
          case '500-1000':
            return investment > 500 && investment <= 1000;
          case '1000+':
            return investment > 1000;
          case 'high_value_200':
            return investment > 200; // High-value clients (top 10%)
          default:
            return true;
        }
      });
    }

    // Token Range filter
    if (filters.tokenRange !== 'all') {
      filtered = filtered.filter(client => {
        const tokens = client.total_tokens_sent || 0;
        
        switch (filters.tokenRange) {
          case '0-100':
            return tokens >= 0 && tokens <= 100;
          case '100-500':
            return tokens > 100 && tokens <= 500;
          case '500-1000':
            return tokens > 500 && tokens <= 1000;
          case '1000-2000':
            return tokens > 1000 && tokens <= 2000;
          case '2000+':
            return tokens > 2000;
          case '1000+':
            return tokens > 1000; // Large token holders
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
        const investment = client.completed_value || 0;
        const transactionCount = client.total_transactions || 0;
        
        switch (filters.transactionActivity) {
          case 'has_transactions':
            return hasTransactions;
          case 'no_transactions':
            return !hasTransactions;
          case 'recent_activity':
            return hasRecentActivity;
          case 'vip_clients':
            // VIP: 3+ transactions OR >$500 invested OR (2+ transactions AND >$200 invested)
            return transactionCount >= 3 || 
                   investment > 500 || 
                   (transactionCount >= 2 && investment > 200);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [clients, filters]);

  return filteredClients;
};