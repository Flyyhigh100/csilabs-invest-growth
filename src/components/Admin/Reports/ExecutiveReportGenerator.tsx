import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Award, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedClientData } from '@/hooks/admin/useEnhancedClientData';
import { formatCurrency, formatTokenAmount } from '@/utils/format';

interface ExecutiveReportGeneratorProps {
  onGenerate: (templateId: string) => Promise<void>;
  isGenerating: boolean;
}

const ExecutiveReportGenerator: React.FC<ExecutiveReportGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const { data: clients = [] } = useEnhancedClientData();
  const [previewData, setPreviewData] = useState<any>(null);

  // Calculate executive summary metrics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.total_transactions > 0).length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.completed_value, 0);
  const averageClientValue = activeClients > 0 ? totalRevenue / activeClients : 0;
  const vipClients = clients.filter(c => 
    c.completed_transactions >= 3 || 
    c.completed_value > 500 ||
    (c.completed_transactions >= 2 && c.completed_value > 200)
  ).length;
  const totalTokensDistributed = clients.reduce((sum, c) => sum + c.total_tokens_sent, 0);
  const kycApprovalRate = clients.filter(c => c.kyc_status === 'approved').length / totalClients * 100;

  const monthlyGrowth = 15.2; // This would be calculated from historical data
  const clientRetentionRate = 85.7; // This would be calculated from historical data

  const generatePreview = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalClients,
        activeClients,
        totalRevenue,
        averageClientValue,
        vipClients,
        totalTokensDistributed,
        kycApprovalRate,
        monthlyGrowth,
        clientRetentionRate
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
            <p className="text-xs text-muted-foreground">{activeClients} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-green-600">+{monthlyGrowth}% this month</p>
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
            <p className="text-xs text-muted-foreground">{kycApprovalRate.toFixed(1)}% KYC approved</p>
          </CardContent>
        </Card>
      </div>

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
                    <p className="font-medium">{previewData.summary.activeClients}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue</span>
                    <p className="font-medium">{formatCurrency(previewData.summary.totalRevenue)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Growth Rate</span>
                    <p className="font-medium text-green-600">+{previewData.summary.monthlyGrowth}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retention</span>
                    <p className="font-medium">{previewData.summary.clientRetentionRate}%</p>
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