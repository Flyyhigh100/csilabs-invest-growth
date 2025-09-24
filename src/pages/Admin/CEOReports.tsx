import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedClientData } from '@/hooks/admin/useEnhancedClientData';
import EnhancedClientDetailView from '@/components/Admin/Users/EnhancedClientDetailView';
import AdminChangeHistoryCard from '@/components/Admin/LegacyAssets/AdminChangeHistoryCard';
import { Search, Crown, TrendingUp, Users, DollarSign, Filter, History } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import AdminLayout from '@/components/Admin/Layout';

const CEOReports = () => {
  const { data: clients = [], isLoading } = useEnhancedClientData();
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [investmentFilter, setInvestmentFilter] = useState('all');

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
      const matchesSearch = !searchTerm || 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesKyc = kycFilter === 'all' || client.kyc_status === kycFilter;
      
      const matchesInvestment = investmentFilter === 'all' || 
        (investmentFilter === 'high' && client.total_invested >= 10000) ||
        (investmentFilter === 'medium' && client.total_invested >= 1000 && client.total_invested < 10000) ||
        (investmentFilter === 'low' && client.total_invested < 1000);

      return matchesSearch && matchesKyc && matchesInvestment;
    });
  }, [clients, searchTerm, kycFilter, investmentFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalClients = clients.length;
    const totalInvestment = clients.reduce((sum, client) => sum + client.total_invested, 0);
    const avgInvestment = totalClients > 0 ? totalInvestment / totalClients : 0;
    const highValueClients = clients.filter(client => client.total_invested >= 10000).length;

    return {
      totalClients,
      totalInvestment,
      avgInvestment,
      highValueClients
    };
  }, [clients]);

  const getKycBadgeVariant = (status): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getInvestmentLevel = (amount: number): { label: string; variant: "default" | "secondary" | "outline" } => {
    if (amount >= 10000) return { label: 'High Value', variant: 'default' };
    if (amount >= 1000) return { label: 'Medium', variant: 'secondary' };
    return { label: 'Entry Level', variant: 'outline' };
  };

  if (isLoading) {
    return (
      <AdminLayout title="CEO Reports">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="CEO Reports">
      <div className="space-y-6">
        {selectedClient ? (
          <div className="space-y-4">
            <EnhancedClientDetailView
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
              onCheckKyc={() => {}}
            />
            
            {/* Add Change History for Selected Client */}
            <AdminChangeHistoryCard
              targetUserId={selectedClient.id}
              userName={`${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim() || selectedClient.email}
            />
          </div>
        ) : (
          <>
            {/* Executive Summary Header */}
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-6 w-6 text-primary" />
              <p className="text-muted-foreground">Executive-level client analytics and insights</p>
            </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalClients}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalInvestment)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Investment</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryStats.avgInvestment)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Value Clients</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.highValueClients}</div>
                <p className="text-xs text-muted-foreground">$10,000+ invested</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="KYC Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={investmentFilter} onValueChange={setInvestmentFilter}>
                <SelectTrigger className="w-40">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Investment Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Value ($10K+)</SelectItem>
                  <SelectItem value="medium">Medium ($1K-$10K)</SelectItem>
                  <SelectItem value="low">Entry Level (&lt;$1K)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const investmentLevel = getInvestmentLevel(client.total_invested);
              const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown';
              
              return (
                <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg truncate">{fullName}</CardTitle>
                        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                      </div>
                      {client.total_invested >= 10000 && (
                        <Crown className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={getKycBadgeVariant(client.kyc_status)}>
                        {client.kyc_status || 'No KYC'}
                      </Badge>
                      <Badge variant={investmentLevel.variant}>
                        {investmentLevel.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Invested</p>
                        <p className="font-semibold">{formatCurrency(client.total_invested)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tokens Owned</p>
                        <p className="font-semibold">{client.total_tokens_sent?.toLocaleString() || '0'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-semibold">{client.completed_transactions || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Price</p>
                        <p className="font-semibold">{formatCurrency(client.average_token_price || 0)}</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setSelectedClient(client)}
                    >
                      View Complete Analysis
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CEOReports;