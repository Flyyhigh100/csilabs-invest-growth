import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortBy?: 'name' | 'created_at' | 'total_value' | 'last_transaction';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    status?: string;
    kyc_status?: string;
    has_transactions?: boolean;
    is_vip?: boolean;
  };
}

interface PaginatedClientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  status: string;
  kyc_status?: string;
  total_transactions: number;
  completed_transactions: number;
  total_value: number;
  completed_value: number;
  last_transaction_date?: string;
  is_vip: boolean;
}

interface PaginatedResponse {
  data: PaginatedClientData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const usePaginatedClients = (options: PaginationOptions) => {
  const { page, pageSize, searchQuery, sortBy, sortOrder, filters } = options;
  
  const queryKey = ['paginated-clients', page, pageSize, searchQuery, sortBy, sortOrder, filters];

  const fetchPaginatedClients = async (): Promise<PaginatedResponse> => {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        created_at,
        status,
        kyc_verifications(status),
        transactions(*)
      `, { count: 'exact' });

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.trim();
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    // Apply status filter
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    // Apply sorting
    switch (sortBy) {
      case 'name':
        query = query.order('first_name', { ascending: sortOrder === 'asc' });
        break;
      case 'created_at':
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: profiles, error, count } = await query;

    if (error) throw error;

    // Process the data to calculate derived fields
    const processedData: PaginatedClientData[] = (profiles || []).map(profile => {
      const transactions = Array.isArray(profile.transactions) ? profile.transactions : [];
      const completedTransactions = transactions.filter(t => t.status === 'completed' && !t.is_test);
      const totalTransactions = transactions.filter(t => !t.is_test);
      
      const totalValue = totalTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const completedValue = completedTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const lastTransaction = transactions
        .filter(t => !t.is_test)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      // Determine VIP status
      const isVip = completedTransactions.length >= 3 || 
                   completedValue > 500 ||
                   (completedTransactions.length >= 2 && completedValue > 200);

      // Get KYC status
      const kycVerifications = Array.isArray(profile.kyc_verifications) 
        ? profile.kyc_verifications 
        : profile.kyc_verifications ? [profile.kyc_verifications] : [];
      
      const latestKyc = kycVerifications
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];

      return {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        created_at: profile.created_at,
        status: profile.status || 'active',
        kyc_status: latestKyc?.status || 'not_started',
        total_transactions: totalTransactions.length,
        completed_transactions: completedTransactions.length,
        total_value: totalValue,
        completed_value: completedValue,
        last_transaction_date: lastTransaction?.created_at,
        is_vip: isVip
      };
    });

    // Apply additional filters that require processed data
    let filteredData = processedData;
    
    if (filters?.kyc_status) {
      filteredData = filteredData.filter(client => client.kyc_status === filters.kyc_status);
    }
    
    if (filters?.has_transactions !== undefined) {
      filteredData = filteredData.filter(client => 
        filters.has_transactions ? client.total_transactions > 0 : client.total_transactions === 0
      );
    }
    
    if (filters?.is_vip !== undefined) {
      filteredData = filteredData.filter(client => client.is_vip === filters.is_vip);
    }

    // Apply custom sorting for computed fields
    if (sortBy === 'total_value') {
      filteredData.sort((a, b) => {
        const aValue = a.completed_value;
        const bValue = b.completed_value;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    } else if (sortBy === 'last_transaction') {
      filteredData.sort((a, b) => {
        const aDate = a.last_transaction_date ? new Date(a.last_transaction_date).getTime() : 0;
        const bDate = b.last_transaction_date ? new Date(b.last_transaction_date).getTime() : 0;
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: filteredData,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  };

  return useQuery({
    queryKey,
    queryFn: fetchPaginatedClients,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Hook for advanced search and filtering
export const useClientSearch = () => {
  const [searchOptions, setSearchOptions] = useState<PaginationOptions>({
    page: 1,
    pageSize: 25,
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: {}
  });

  const updateSearchOptions = (updates: Partial<PaginationOptions>) => {
    setSearchOptions(prev => ({
      ...prev,
      ...updates,
      // Reset to page 1 when changing search/filter criteria
      page: updates.searchQuery !== undefined || updates.filters !== undefined ? 1 : updates.page || prev.page
    }));
  };

  const resetFilters = () => {
    setSearchOptions(prev => ({
      page: 1,
      pageSize: prev.pageSize,
      searchQuery: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      filters: {}
    }));
  };

  const clientsQuery = usePaginatedClients(searchOptions);

  return {
    searchOptions,
    updateSearchOptions,
    resetFilters,
    ...clientsQuery
  };
};