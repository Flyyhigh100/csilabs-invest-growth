import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Award, Download, Eye, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedClientData } from '@/hooks/admin/useEnhancedClientData';
import { formatCurrency, formatTokenAmount } from '@/utils/format';
import { isWithinInterval, subDays, subMonths } from 'date-fns';

interface ExecutiveReportGeneratorProps {
  onGenerate: (templateId: string) => Promise<void>;
  isGenerating: boolean;
}

const ExecutiveReportGenerator: React.FC<ExecutiveReportGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const { data: clients = [] } = useEnhancedClientData();
  const [previewData, setPreviewData] = useState<any>(null);

  // Calculate time-based metrics
  const now = new Date();
  const last30Days = subDays(now, 30);
  const last7Days = subDays(now, 7);
  const last3Months = subMonths(now, 3);

  // Core client metrics with time context
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.total_transactions > 0).length;
  const recentActiveClients = clients.filter(c => 
    c.last_transaction_date && 
    isWithinInterval(new Date(c.last_transaction_date), { start: last30Days, end: now })
  ).length;
  const weeklyActiveClients = clients.filter(c => 
    c.last_transaction_date && 
    isWithinInterval(new Date(c.last_transaction_date), { start: last7Days, end: now })
  ).length;

  // Revenue and transaction metrics
  const totalRevenue = clients.reduce((sum, c) => sum + c.completed_value, 0);
  const averageClientValue = activeClients > 0 ? totalRevenue / activeClients : 0;
  const totalTransactions = clients.reduce((sum, c) => sum + c.total_transactions, 0);
  const averageTransactionSize = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // VIP and client segmentation
  const vipClients = clients.filter(c => 
    c.completed_transactions >= 3 || 
    c.completed_value > 500 ||
    (c.completed_transactions >= 2 && c.completed_value > 200)
  ).length;

  // Token distribution metrics
  const totalTokensDistributed = clients.reduce((sum, c) => sum + c.total_tokens_sent, 0);
  const totalTokensPurchased = clients.reduce((sum, c) => sum + c.total_tokens_purchased, 0);
  const tokensPendingDelivery = clients.reduce((sum, c) => sum + c.tokens_pending_delivery, 0);
  const tokenDeliveryRate = totalTokensPurchased > 0 ? (totalTokensDistributed / totalTokensPurchased) * 100 : 0;

  // KYC metrics with detailed breakdown
  const kycSubmitted = clients.filter(c => c.has_kyc_record).length;
  const kycApproved = clients.filter(c => c.kyc_status === 'approved').length;
  const kycPending = clients.filter(c => c.kyc_status === 'pending' || c.kyc_status === 'submitted').length;
  const kycApprovalRateOfSubmitted = kycSubmitted > 0 ? (kycApproved / kycSubmitted) * 100 : 0;
  const overallKycCompletionRate = totalClients > 0 ? (kycSubmitted / totalClients) * 100 : 0;

  // Business health indicators
  const clientsWithoutWallets = clients.filter(c => !c.wallet_address && !c.solana_wallet_address).length;
  const testDataClients = clients.filter(c => c.has_test_data).length;
  
  // Calculate actual monthly growth from new clients
  const newClientsLast30Days = clients.filter(c => 
    isWithinInterval(new Date(c.created_at), { start: last30Days, end: now })
  ).length;
  const newClientsLast90Days = clients.filter(c => 
    isWithinInterval(new Date(c.created_at), { start: last3Months, end: now })
  ).length;
  const monthlyGrowthRate = newClientsLast30Days / totalClients * 100;

  const generatePreview = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
        summary: {
          totalClients,
          activeClients,
          recentActiveClients,
          weeklyActiveClients,
          totalRevenue,
          averageClientValue,
          averageTransactionSize,
          vipClients,
          totalTokensDistributed,
          totalTokensPurchased,
          tokensPendingDelivery,
          tokenDeliveryRate,
          kycApprovalRateOfSubmitted,
          overallKycCompletionRate,
          kycApproved,
          kycSubmitted,
          kycPending,
          monthlyGrowthRate,
          newClientsLast30Days,
          clientsWithoutWallets
        },
      topClients: clients
        .sort((a, b) => b.completed_value - a.completed_value)
        .slice(0, 5),
      keyMetrics: {
        pendingTokens: clients.reduce((sum, c) => sum + c.tokens_pending_delivery, 0),
        pendingTransactions: clients.reduce((sum, c) => sum + c.pending_transactions, 0),
        averageTransactionSize: totalRevenue / clients.reduce((sum, c) => sum + c.total_transactions, 0) || 0,
        testDataPercentage: clients.filter(c => c.has_test_data).length / totalClients * 100
      }
    };
    setPreviewData(reportData);
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Clients</span>
            </div>
            <p className="text-2xl font-bold">{totalClients}</p>
            <p className="text-xs text-muted-foreground">{activeClients} active (all time) • {recentActiveClients} active (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(averageTransactionSize)} avg. transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">VIP Clients</span>
            </div>
            <p className="text-2xl font-bold">{vipClients}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(averageClientValue)} avg. value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Tokens Distributed</span>
            </div>
            <p className="text-2xl font-bold">{formatTokenAmount(totalTokensDistributed)}</p>
            <p className="text-xs text-muted-foreground">{tokenDeliveryRate.toFixed(1)}% delivery rate • {formatTokenAmount(tokensPendingDelivery)} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Health & KYC Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">KYC Status</span>
            </div>
            <p className="text-2xl font-bold">{kycApprovalRateOfSubmitted.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {kycApproved} approved of {kycSubmitted} submitted ({overallKycCompletionRate.toFixed(1)}% total completion)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Growth Rate</span>
            </div>
            <p className="text-2xl font-bold">+{monthlyGrowthRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {newClientsLast30Days} new clients this month ({newClientsLast90Days} last 90 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-muted-foreground">Action Items</span>
            </div>
            <p className="text-2xl font-bold">{clientsWithoutWallets + kycPending}</p>
            <p className="text-xs text-muted-foreground">
              {clientsWithoutWallets} need wallets • {kycPending} KYC pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Executive Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Business Insights</CardTitle>
          <CardDescription>Key findings and recommendations based on current data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">KYC & Compliance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KYC Approval Rate (submitted):</span>
                  <span className="font-medium">{kycApprovalRateOfSubmitted.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall KYC Completion:</span>
                  <span className="font-medium">{overallKycCompletionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending KYC Reviews:</span>
                  <span className="font-medium">{kycPending}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Token Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Purchased:</span>
                  <span className="font-medium">{formatTokenAmount(totalTokensPurchased)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Delivered:</span>
                  <span className="font-medium">{formatTokenAmount(totalTokensDistributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Efficiency:</span>
                  <span className="font-medium">{tokenDeliveryRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Key Recommendations</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Focus on KYC completion - only {overallKycCompletionRate.toFixed(1)}% of clients have submitted KYC</li>
              <li>• {clientsWithoutWallets} clients need wallet setup assistance for token delivery</li>
              <li>• {tokensPendingDelivery > 0 ? `${formatTokenAmount(tokensPendingDelivery)} tokens awaiting delivery to approved clients` : 'All purchased tokens have been delivered'}</li>
              <li>• {weeklyActiveClients} clients transacted in the last 7 days (engagement opportunity)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Report Templates</CardTitle>
          <CardDescription>Professional reports for leadership and stakeholders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">CEO Dashboard Summary</h4>
                    <p className="text-sm text-muted-foreground">High-level KPIs and business metrics</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generatePreview}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onGenerate('ceo-dashboard')}
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Board Presentation</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive business overview for board meetings</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generatePreview}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onGenerate('board-presentation')}
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>Executive Summary - Generated {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Key Metrics Section */}
              <div>
                <h3 className="font-semibold mb-3">Key Business Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Active Clients</span>
                    <p className="font-medium">{previewData.summary.activeClients} (all time)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue</span>
                    <p className="font-medium">{formatCurrency(previewData.summary.totalRevenue)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Growth Rate</span>
                    <p className="font-medium text-green-600">+{previewData.summary.monthlyGrowthRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Token Delivery</span>
                    <p className="font-medium">{previewData.summary.tokenDeliveryRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Top Clients */}
              <div>
                <h3 className="font-semibold mb-3">Top 5 Clients by Investment</h3>
                <div className="space-y-2">
                  {previewData.topClients.map((client: any, index: number) => (
                     <div key={client.id} className="flex items-center justify-between p-2 border rounded">
                       <div className="flex items-center gap-2">
                         <Badge variant="outline">{index + 1}</Badge>
                         <span className="font-medium">{client.first_name} {client.last_name}</span>
                         <span className="text-sm text-muted-foreground">
                           {formatTokenAmount(client.total_tokens_sent)} tokens
                         </span>
                       </div>
                       <span className="font-medium">{formatCurrency(client.completed_value)}</span>
                     </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => onGenerate('executive-summary')} disabled={isGenerating}>
                  Generate Full Report
                </Button>
                <Button variant="outline" onClick={() => setPreviewData(null)}>
                  Close Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExecutiveReportGenerator;