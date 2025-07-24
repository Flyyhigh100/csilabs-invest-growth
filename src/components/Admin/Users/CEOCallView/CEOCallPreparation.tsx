import React, { useState } from 'react';
import { Phone, Video, Calendar, Clock, MessageSquare, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatTokenAmount } from '@/utils/format';
import type { EnhancedClientData } from '@/hooks/admin/useEnhancedClientData';
import ClientNotesSection from './ClientNotesSection';
import InteractionHistory from './InteractionHistory';
import FollowUpManager from './FollowUpManager';
import CallQuickActions from './CallQuickActions';

interface CEOCallPreparationProps {
  client: EnhancedClientData;
  onClose: () => void;
}

const CEOCallPreparation: React.FC<CEOCallPreparationProps> = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate key metrics for quick reference
  const totalInvested = client.completed_value;
  const totalTokens = client.total_tokens_purchased;
  const averageInvestment = client.completed_transactions > 0 
    ? totalInvested / client.completed_transactions 
    : 0;
  
  const clientSegment = totalInvested > 500 ? 'VIP' : totalInvested > 200 ? 'High-Value' : 'Standard';
  const segmentColor = clientSegment === 'VIP' ? 'bg-purple-100 text-purple-800' : 
                      clientSegment === 'High-Value' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      {/* Header - Client Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {client.first_name} {client.last_name}
            </h2>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={segmentColor}>{clientSegment} Client</Badge>
            {client.kyc_status === 'approved' && (
              <Badge className="bg-green-100 text-green-800">KYC Verified</Badge>
            )}
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Tokens Owned</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatTokenAmount(totalTokens)}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{client.total_transactions}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Investment</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(averageInvestment)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <CallQuickActions client={client} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Call Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes & History</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="profile">Full Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Background */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Client Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-muted-foreground">
                    {client.city}, {client.state_province} {client.postal_code}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p className="text-muted-foreground">{client.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium">Preferred Network:</span>
                  <p className="text-muted-foreground capitalize">Polygon</p>
                </div>
                <div>
                  <span className="font-medium">Member Since:</span>
                  <p className="text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Investment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Completed Transactions:</span>
                  <span className="font-medium">{client.completed_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Transactions:</span>
                  <span className="font-medium">{client.pending_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens Sent:</span>
                  <span className="font-medium">{formatTokenAmount(client.total_tokens_sent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens Pending:</span>
                  <span className="font-medium">{formatTokenAmount(client.tokens_pending_delivery)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Average Token Price:</span>
                  <span className="font-medium">{formatCurrency(client.average_token_price)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call Talking Points */}
          <Card>
            <CardHeader>
              <CardTitle>Call Talking Points</CardTitle>
              <CardDescription>Key topics to discuss based on client profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Positive Points</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {totalInvested > 200 && <li>• High-value investor ({formatCurrency(totalInvested)} invested)</li>}
                    {client.completed_transactions > 2 && <li>• Loyal customer with {client.completed_transactions} transactions</li>}
                    {client.kyc_status === 'approved' && <li>• Fully verified and compliant</li>}
                    {client.total_tokens_sent > 0 && <li>• Active token holder</li>}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Areas to Address</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {client.pending_transactions > 0 && <li>• {client.pending_transactions} pending transactions</li>}
                    {client.tokens_pending_delivery > 0 && <li>• {formatTokenAmount(client.tokens_pending_delivery)} tokens pending delivery</li>}
                    {client.kyc_status !== 'approved' && <li>• KYC verification needed</li>}
                    {!client.phone_number && <li>• Missing contact information</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientNotesSection clientId={client.id} />
              <InteractionHistory clientId={client.id} />
            </div>
            <FollowUpManager clientId={client.id} />
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          {/* Transaction history would go here - reuse existing transaction components */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed transaction history component would be integrated here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          {/* Full profile view would go here - reuse existing profile components */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Client Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete client profile component would be integrated here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CEOCallPreparation;