import React, { useState } from 'react';
import { FileText, Download, Calendar, Users, TrendingUp, Shield, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ExecutiveReportGenerator from './ExecutiveReportGenerator';
import ShareholderReportGenerator from './ShareholderReportGenerator';
import OperationalReportGenerator from './OperationalReportGenerator';

const ReportsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('executive');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'High-level overview for leadership',
      icon: TrendingUp,
      category: 'executive'
    },
    {
      id: 'shareholder-report',
      title: 'Shareholder Report',
      description: 'Investment performance and metrics',
      icon: FileText,
      category: 'financial'
    },
    {
      id: 'client-analytics',
      title: 'Client Analytics',
      description: 'Detailed client behavior analysis',
      icon: Users,
      category: 'operational'
    },
    {
      id: 'kyc-compliance',
      title: 'KYC Compliance Report',
      description: 'Verification and compliance status',
      icon: Shield,
      category: 'compliance'
    },
    {
      id: 'token-distribution',
      title: 'Token Distribution Report',
      description: 'Token allocation and delivery status',
      icon: TrendingUp,
      category: 'operational'
    },
    {
      id: 'financial-overview',
      title: 'Financial Overview',
      description: 'Revenue and transaction analysis',
      icon: TrendingUp,
      category: 'financial'
    }
  ];

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${reportTemplates.find(t => t.id === templateId)?.title} generated successfully`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data' },
    { value: 'json', label: 'JSON Data' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate comprehensive reports for stakeholders and analysis</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-4">
          <ExecutiveReportGenerator onGenerate={handleGenerateReport} isGenerating={isGenerating} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <ShareholderReportGenerator onGenerate={handleGenerateReport} isGenerating={isGenerating} />
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <OperationalReportGenerator onGenerate={handleGenerateReport} isGenerating={isGenerating} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Reports
              </CardTitle>
              <CardDescription>KYC verification and regulatory compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates
                  .filter(template => template.category === 'compliance')
                  .map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">{template.title}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleGenerateReport(template.id)}
                            disabled={isGenerating}
                            className="w-full"
                          >
                            {isGenerating ? 'Generating...' : 'Generate Report'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common reporting tasks and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Custom Date Range Report</div>
                    <div className="text-sm text-muted-foreground">Select specific time period</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Custom Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Report Template</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={setDateRange}
                      className="w-full"
                    />
                  </div>
                  
                  <Button onClick={() => selectedTemplate && handleGenerateReport(selectedTemplate)} disabled={!selectedTemplate || isGenerating}>
                    Generate Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Export All Data</div>
                <div className="text-sm text-muted-foreground">Download complete dataset</div>
              </div>
            </Button>

            <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
              <Printer className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Print-Ready Reports</div>
                <div className="text-sm text-muted-foreground">Format for printing</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsHub;