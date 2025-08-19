import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, CreditCard, Calendar, Activity } from 'lucide-react';

interface DrillDownData {
  type: 'revenue' | 'payment_method' | 'transaction_status' | 'user_registration' | 'kyc_status' | 'user_activity';
  title: string;
  value: string | number;
  category?: string;
  details?: Record<string, any>;
  trends?: Array<{ period: string; value: number }>;
}

interface ChartDrillDownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DrillDownData | null;
}

const ChartDrillDownDialog: React.FC<ChartDrillDownDialogProps> = ({
  open,
  onOpenChange,
  data
}) => {
  if (!data) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'payment_method': return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'transaction_status': return <Activity className="h-5 w-5 text-purple-600" />;
      case 'user_registration': return <Users className="h-5 w-5 text-indigo-600" />;
      case 'kyc_status': return <Badge className="h-5 w-5 text-orange-600" />;
      case 'user_activity': return <TrendingUp className="h-5 w-5 text-pink-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (data.type === 'revenue') {
        return `$${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon(data.type)}
            {data.title} - Detailed View
          </DialogTitle>
          <DialogDescription>
            {data.category && `Category: ${data.category} • `}
            Interactive drill-down analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Metric Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Primary Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {formatValue(data.value)}
              </div>
              {data.category && (
                <div className="mt-2">
                  <Badge variant="secondary">{data.category}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          {data.details && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trends */}
          {data.trends && data.trends.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recent Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.trends.map((trend, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{trend.period}</span>
                      <span className="text-sm font-medium">
                        {formatValue(trend.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Hints */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Drill-down enabled:</strong> This data represents a specific segment from your {data.type.replace('_', ' ')} analytics. 
                You can explore related transactions, users, or time periods for deeper insights.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartDrillDownDialog;