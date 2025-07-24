import React from 'react';
import { Users, Activity, Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OperationalReportGeneratorProps {
  onGenerate: (templateId: string) => Promise<void>;
  isGenerating: boolean;
}

const OperationalReportGenerator: React.FC<OperationalReportGeneratorProps> = ({ onGenerate, isGenerating }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Operational Reports
        </CardTitle>
        <CardDescription>Day-to-day operations and client management reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Client Analytics</h4>
                  <p className="text-sm text-muted-foreground">Detailed client behavior and engagement</p>
                </div>
              </div>
              <Button
                onClick={() => onGenerate('client-analytics')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Transaction Report</h4>
                  <p className="text-sm text-muted-foreground">Transaction analysis and processing status</p>
                </div>
              </div>
              <Button
                onClick={() => onGenerate('transaction-report')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationalReportGenerator;