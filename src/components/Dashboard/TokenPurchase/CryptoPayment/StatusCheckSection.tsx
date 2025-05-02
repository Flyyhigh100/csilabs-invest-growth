
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";

interface StatusCheckSectionProps {
  statusUrl?: string;  // Keep for backward compatibility
  statusCheckUrl?: string;  // New property name
  transactionId?: string;
}

const StatusCheckSection: React.FC<StatusCheckSectionProps> = ({ 
  statusUrl, 
  statusCheckUrl,
  transactionId 
}) => {
  // Use either statusCheckUrl or statusUrl, whichever is provided
  const url = statusCheckUrl || statusUrl || '';
  
  if (!url) {
    return null;
  }
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500" />
        Check Payment Status
      </h3>
      <p className="text-sm mb-3">
        You can check the status of your payment on the CoinPayments website:
      </p>
      <Button asChild variant="outline" className="w-full">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2"
        >
          View Payment Status
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
};

export default StatusCheckSection;
