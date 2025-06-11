
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FunnelChart, Funnel, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingDown, Eye, Users, ArrowRight, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ConversionFunnelData {
  stage: string;
  users: number;
  description: string;
}

interface ConversionFunnelChartProps {
  funnelData: ConversionFunnelData[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ funnelData }) => {
  const [selectedStage, setSelectedStage] = useState<ConversionFunnelData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleStageClick = (data: any) => {
    const stageData = funnelData.find(stage => stage.stage === data.stage);
    if (stageData) {
      setSelectedStage(stageData);
      setDetailModalOpen(true);
    }
  };

  const getDropoffData = () => {
    if (!selectedStage) return null;
    
    const currentIndex = funnelData.findIndex(stage => stage.stage === selectedStage.stage);
    const nextStage = funnelData[currentIndex + 1];
    const prevStage = funnelData[currentIndex - 1];
    
    return {
      current: selectedStage,
      next: nextStage,
      previous: prevStage,
      currentIndex,
      conversionFromPrevious: prevStage 
        ? ((selectedStage.users / prevStage.users) * 100).toFixed(1)
        : '100.0',
      dropoffToNext: nextStage 
        ? (((selectedStage.users - nextStage.users) / selectedStage.users) * 100).toFixed(1)
        : '0.0'
    };
  };

  const renderStageDetails = () => {
    if (!selectedStage) return null;
    
    const dropoffData = getDropoffData();
    if (!dropoffData) return null;

    const totalUsers = funnelData[0]?.users || 1;
    const overallConversion = ((selectedStage.users / totalUsers) * 100).toFixed(1);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">{selectedStage.stage}</h3>
            <p className="text-sm text-muted-foreground">{selectedStage.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{selectedStage.users.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Users at this stage</div>
          </div>
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-600">{overallConversion}%</div>
            <div className="text-sm text-muted-foreground">Overall conversion rate</div>
          </div>
        </div>

        {dropoffData.previous && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              Conversion from Previous Stage
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">{dropoffData.previous.stage}</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {dropoffData.previous.users.toLocaleString()} users
                </Badge>
              </div>
              <Progress value={parseFloat(dropoffData.conversionFromPrevious)} className="h-2" />
              <div className="flex justify-between items-center text-sm">
                <span>Conversion Rate:</span>
                <span className="font-medium text-green-600">{dropoffData.conversionFromPrevious}%</span>
              </div>
            </div>
          </div>
        )}

        {dropoffData.next && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Drop-off to Next Stage
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">{dropoffData.next.stage}</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {dropoffData.next.users.toLocaleString()} users
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Drop-off Rate:</span>
                <span className="font-medium text-red-600">{dropoffData.dropoffToNext}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {(selectedStage.users - dropoffData.next.users).toLocaleString()} users did not proceed to the next stage
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Stage Position</h4>
          <div className="flex items-center gap-2 text-sm">
            <span>Stage {dropoffData.currentIndex + 1} of {funnelData.length}</span>
            <div className="flex-1 mx-2">
              <Progress value={((dropoffData.currentIndex + 1) / funnelData.length) * 100} className="h-1" />
            </div>
            <span className="text-muted-foreground">
              {(((dropoffData.currentIndex + 1) / funnelData.length) * 100).toFixed(0)}% through funnel
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded">
          💡 This data represents real user progression through your platform
        </div>
      </div>
    );
  };

  // Calculate conversion rates between stages
  const conversionRates = funnelData.map((stage, index) => {
    if (index === 0) return 100;
    const previousStage = funnelData[index - 1];
    return ((stage.users / previousStage.users) * 100).toFixed(1);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Interactive Conversion Funnel
            <Eye className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardTitle>
          <CardDescription>
            Click on any stage to see detailed conversion analytics and drop-off analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer config={{}} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Funnel
                    dataKey="users"
                    data={funnelData}
                    isAnimationActive
                    onClick={handleStageClick}
                    className="cursor-pointer"
                  >
                    <LabelList dataKey="stage" position="center" fill="#fff" fontSize="12" />
                    {funnelData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Funnel>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [
                      `${value} users (click for details)`,
                      props?.payload?.stage || 'Stage'
                    ]}
                  />
                </FunnelChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conversion Overview</h3>
              {funnelData.map((stage, index) => (
                <div 
                  key={stage.stage}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                  onClick={() => handleStageClick(stage)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{stage.stage}</span>
                      <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <Badge variant="outline">
                      {stage.users.toLocaleString()} users
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{stage.description}</span>
                    <span className="font-medium">
                      {conversionRates[index]}% conversion
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Conversion Stage Analysis</DialogTitle>
            <DialogDescription>
              Detailed conversion metrics and user flow analysis
            </DialogDescription>
          </DialogHeader>
          {renderStageDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversionFunnelChart;
