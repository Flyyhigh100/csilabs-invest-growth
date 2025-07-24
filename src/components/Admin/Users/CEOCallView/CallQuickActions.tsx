import React from 'react';
import { Phone, Video, Mail, Calendar, FileText, DollarSign, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import type { EnhancedClientData } from '@/hooks/admin/useEnhancedClientData';

interface CallQuickActionsProps {
  client: EnhancedClientData;
}

const CallQuickActions: React.FC<CallQuickActionsProps> = ({ client }) => {
  const handlePhoneCall = () => {
    if (client.phone_number) {
      window.open(`tel:${client.phone_number}`);
      toast.success('Initiating phone call...');
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = () => {
    if (client.email) {
      window.open(`mailto:${client.email}?subject=CSI Token Follow-up`);
      toast.success('Opening email client...');
    } else {
      toast.error('No email address available');
    }
  };

  const handleVideoCall = () => {
    // This would integrate with your video calling system
    toast.info('Video call feature would integrate with your calling system');
  };

  const handleScheduleFollowUp = () => {
    // This would integrate with your calendar system
    toast.info('Calendar integration would open here');
  };

  const handleSendTokens = () => {
    // This would navigate to token sending interface
    toast.info('Token sending interface would open here');
  };

  const handleGenerateReport = () => {
    // This would generate a client report
    toast.info('Client report generation would start here');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePhoneCall}
            disabled={!client.phone_number}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleVideoCall}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Video
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEmail}
            disabled={!client.email}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleScheduleFollowUp}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTokens}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Tokens
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Report
          </Button>
        </div>

        {/* Quick Copy Section */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Quick Copy:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {client.email && (
              <button
                onClick={() => copyToClipboard(client.email!, 'Email')}
                className="text-left p-2 rounded border hover:bg-muted"
              >
                <span className="font-medium">Email:</span> {client.email}
              </button>
            )}
            {client.phone_number && (
              <button
                onClick={() => copyToClipboard(client.phone_number!, 'Phone')}
                className="text-left p-2 rounded border hover:bg-muted"
              >
                <span className="font-medium">Phone:</span> {client.phone_number}
              </button>
            )}
            {client.wallet_address && (
              <button
                onClick={() => copyToClipboard(client.wallet_address!, 'Wallet Address')}
                className="text-left p-2 rounded border hover:bg-muted font-mono text-xs"
              >
                <span className="font-medium">Wallet:</span> {client.wallet_address.slice(0, 20)}...
              </button>
            )}
            {client.solana_wallet_address && (
              <button
                onClick={() => copyToClipboard(client.solana_wallet_address!, 'Solana Wallet')}
                className="text-left p-2 rounded border hover:bg-muted font-mono text-xs"
              >
                <span className="font-medium">Solana:</span> {client.solana_wallet_address.slice(0, 20)}...
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallQuickActions;