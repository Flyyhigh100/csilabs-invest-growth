import React from 'react';
import { DollarSign, TrendingUp, PieChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ShareholderReportGeneratorProps {
  onGenerate: (templateId: string) => Promise<void>;
  isGenerating: boolean;
}

const ShareholderReportGenerator: React.FC<ShareholderReportGeneratorProps> = ({ onGenerate, isGenerating }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial & Shareholder Reports
        </CardTitle>
        <CardDescription>Investment performance and financial analysis reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Revenue Analysis</h4>
                  <p className="text-sm text-muted-foreground">Detailed revenue breakdown and trends</p>
                </div>
              </div>
              <Button
                onClick={() => onGenerate('revenue-analysis')}
                disabled={isGenerating}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <PieChart className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Token Distribution</h4>
                  <p className="text-sm text-muted-foreground">Token allocation and ownership analysis</p>
                </div>
              </div>
              <Button
                onClick={() => onGenerate('token-distribution')}
                disabled={isGenerating}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareholderReportGenerator;