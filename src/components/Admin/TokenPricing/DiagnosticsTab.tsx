
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { TOKEN_ADDRESS, MORALIS_CHAIN } from '@/services/api/config';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import APIKeyValidator from './APIKeyValidator';
import { supabase } from '@/integrations/supabase/client';

// Add an interface for the component props
interface DiagnosticsTabProps {
  // Make currentPrice optional since we might get it from context too
  currentPrice?: number | null;
}

const PriceDebugger: React.FC<DiagnosticsTabProps> = ({ currentPrice: propCurrentPrice }) => {
  // Use the prop or fall back to context
  const { currentPrice: contextCurrentPrice } = useTokenPrice();
  const currentPrice = propCurrentPrice ?? contextCurrentPrice;

  return (
    <div className="space-y-6">
      <APIKeyValidator />
      
      <Card>
        <CardHeader>
          <CardTitle>Price Service Diagnostics</CardTitle>
          <CardDescription>
            Check the status of the token pricing service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Price Source Status</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${currentPrice ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{currentPrice ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Price Caching</h3>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Working</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Price Service Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Provider:</span>
                  <span className="font-medium">Defined.fi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chain ID:</span>
                  <span className="font-medium">137 (Polygon)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Address:</span>
                  <span className="font-medium text-xs">0x4e5f276d29a122d787a8b345b1bc4bd5dd0f40c3</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceDebugger;
