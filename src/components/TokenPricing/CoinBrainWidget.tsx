import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoinBrainWidgetProps {
  contractAddress?: string;
  onFallback?: () => void;
}

const CoinBrainWidget: React.FC<CoinBrainWidgetProps> = ({ 
  contractAddress = "0xcba5ca199bca0af3f6046da01169035f2c6a7ff0",
  onFallback 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onFallback?.();
  };

  if (hasError) {
    return (
      <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-primary/20">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-foreground">Chart unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to load CoinBrain chart
            </p>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between max-w-xs mx-auto"
            asChild
          >
            <a
              href={`https://coinbrain.com/coins/matic-${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View on CoinBrain</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/20">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <iframe
        src={`https://coinbrain.com/embed/chart?address=${contractAddress}&chainId=137&theme=light`}
        width="100%"
        height="520"
        frameBorder="0"
        onLoad={handleLoad}
        onError={handleError}
        className="w-full"
        title="CoinBrain Price Chart"
        sandbox="allow-scripts allow-same-origin"
      />
    </Card>
  );
};

export default CoinBrainWidget;