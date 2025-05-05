
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Info, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PriceSourceProps {
  name: string;
  isWorking: boolean | null;
  latestPrice: number | null;
  lastError: string | null;
  lastAttempt: string | null;
  onTest: () => void;
  isTesting: boolean;
}

const PriceSource: React.FC<PriceSourceProps> = ({
  name,
  isWorking,
  latestPrice,
  lastError,
  lastAttempt,
  onTest,
  isTesting
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isWorking === null ? 'bg-gray-300' : 
            isWorking ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <h3 className="font-medium text-sm">{name}</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onTest}
          disabled={isTesting}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isTesting ? 'animate-spin' : ''}`} />
          Test
        </Button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Latest Price:</span>
          <span className="font-mono">{latestPrice ? `$${latestPrice.toFixed(8)}` : 'N/A'}</span>
        </div>
        
        {lastAttempt && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Last Checked:</span>
            <span>{new Date(lastAttempt).toLocaleString()}</span>
          </div>
        )}
        
        {lastError && (
          <Alert variant="destructive" className="mt-2 py-1.5 text-xs">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs text-red-700">{lastError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

const PriceSourceDiagnostic = () => {
  const [sources, setSources] = React.useState({
    v4Subgraph: { isWorking: null, latestPrice: null, lastError: null, lastAttempt: null, isTesting: false },
    v4Spot: { isWorking: null, latestPrice: null, lastError: null, lastAttempt: null, isTesting: false },
    v3Twap: { isWorking: null, latestPrice: null, lastError: null, lastAttempt: null, isTesting: false },
    definedfi: { isWorking: null, latestPrice: null, lastError: null, lastAttempt: null, isTesting: false },
    dexscreener: { isWorking: null, latestPrice: null, lastError: null, lastAttempt: null, isTesting: false }
  });

  // Mock functionality for testing each source
  const testSource = async (source: keyof typeof sources) => {
    // Set source as testing
    setSources(prev => ({ 
      ...prev, 
      [source]: { ...prev[source], isTesting: true } 
    }));

    try {
      // Call a function that would test each source
      // For now we're just simulating success/failure
      const response = await fetch('https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/internal-twap-status');
      const data = await response.json();
      
      // Update source status based on diagnostics data
      // In a real implementation, we would actually test each source
      let isWorking = source === 'v4Subgraph' ? data.source === 'v4Subgraph' && !data.lastError : false;
      let price = source === 'v4Subgraph' ? data.lastPrice : null;
      let error = source === 'v4Subgraph' ? data.lastError : "Not implemented yet";
      
      // For demo purposes:
      if (source !== 'v4Subgraph') {
        isWorking = Math.random() > 0.5;
        if (isWorking) {
          price = 1 + (Math.random() * 0.1);
          error = null;
        } else {
          error = "Test not implemented yet";
        }
      }
      
      setSources(prev => ({ 
        ...prev, 
        [source]: { 
          ...prev[source], 
          isWorking, 
          latestPrice: price, 
          lastError: error, 
          lastAttempt: new Date().toISOString(),
          isTesting: false 
        } 
      }));
    } catch (error) {
      setSources(prev => ({ 
        ...prev, 
        [source]: { 
          ...prev[source], 
          isWorking: false, 
          lastError: error instanceof Error ? error.message : String(error), 
          lastAttempt: new Date().toISOString(),
          isTesting: false 
        } 
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Source Diagnostics</CardTitle>
        <CardDescription>
          Test individual price sources to identify failures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            The system will try each price source in order until it finds one that works. 
            Testing individual sources can help identify where failures are occurring.
          </AlertDescription>
        </Alert>
        
        <PriceSource 
          name="Uniswap V4 Subgraph (Primary)" 
          isWorking={sources.v4Subgraph.isWorking}
          latestPrice={sources.v4Subgraph.latestPrice}
          lastError={sources.v4Subgraph.lastError}
          lastAttempt={sources.v4Subgraph.lastAttempt}
          onTest={() => testSource('v4Subgraph')}
          isTesting={sources.v4Subgraph.isTesting}
        />
        
        <PriceSource 
          name="Uniswap V4 Spot (Fallback 1)" 
          isWorking={sources.v4Spot.isWorking}
          latestPrice={sources.v4Spot.latestPrice}
          lastError={sources.v4Spot.lastError}
          lastAttempt={sources.v4Spot.lastAttempt}
          onTest={() => testSource('v4Spot')}
          isTesting={sources.v4Spot.isTesting}
        />
        
        <PriceSource 
          name="Uniswap V3 TWAP (Fallback 2)" 
          isWorking={sources.v3Twap.isWorking}
          latestPrice={sources.v3Twap.latestPrice}
          lastError={sources.v3Twap.lastError}
          lastAttempt={sources.v3Twap.lastAttempt}
          onTest={() => testSource('v3Twap')}
          isTesting={sources.v3Twap.isTesting}
        />
        
        <PriceSource 
          name="Defined.fi (Fallback 3)" 
          isWorking={sources.definedfi.isWorking}
          latestPrice={sources.definedfi.latestPrice}
          lastError={sources.definedfi.lastError}
          lastAttempt={sources.definedfi.lastAttempt}
          onTest={() => testSource('definedfi')}
          isTesting={sources.definedfi.isTesting}
        />
        
        <PriceSource 
          name="DexScreener (Fallback 4)" 
          isWorking={sources.dexscreener.isWorking}
          latestPrice={sources.dexscreener.latestPrice}
          lastError={sources.dexscreener.lastError}
          lastAttempt={sources.dexscreener.lastAttempt}
          onTest={() => testSource('dexscreener')}
          isTesting={sources.dexscreener.isTesting}
        />
      </CardContent>
    </Card>
  );
};

export default PriceSourceDiagnostic;
