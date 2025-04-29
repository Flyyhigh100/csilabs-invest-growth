
import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface StatusCheckSectionProps {
  checkStatusUrl: string;
}

const StatusCheckSection: React.FC<StatusCheckSectionProps> = ({ checkStatusUrl }) => {
  const [isChecking, setIsChecking] = React.useState(false);
  
  const handleCheckStatus = () => {
    setIsChecking(true);
    
    // Navigate to the status page
    if (checkStatusUrl.startsWith('/')) {
      window.location.href = checkStatusUrl;
    } else {
      window.open(checkStatusUrl, '_blank');
    }
    
    // Reset state after a short delay
    setTimeout(() => {
      setIsChecking(false);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Payment Status</h3>
      <p className="text-sm text-gray-600">
        You can check the status of your payment at any time:
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={handleCheckStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Check Payment Status
        </Button>
        
        {checkStatusUrl.startsWith('http') && (
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => window.open(checkStatusUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            View on Payment Processor
          </Button>
        )}
      </div>
    </div>
  );
};

export default StatusCheckSection;
