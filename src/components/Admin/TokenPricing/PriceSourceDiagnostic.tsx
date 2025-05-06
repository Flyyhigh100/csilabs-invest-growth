
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UNISWAP_V3_POOL, UNISWAP_V3_URL } from '@/services/api/config';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

const PriceSourceDiagnostic = () => {
  const [apiStatus, setApiStatus] = useState<{isConnected: boolean, details?: string}>({isConnected: false});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          return;
        }
        
        // Check if user is in admins table
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error || !data) {
          // Try checking by email
          const { data: dataByEmail, error: errorByEmail } = await supabase
            .from('admins')
            .select('*')
            .eq('email', user.email)
            .single();
          
          setIsAdmin(!!dataByEmail && !errorByEmail);
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    }
    
    checkAdminStatus();
  }, []);
  
  const checkApiStatus = async () => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      // Simple test to check if Uniswap Subgraph is accessible
      const response = await fetch(UNISWAP_V3_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ _meta { block { number } } }`
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data?.data?._meta) {
        setApiStatus({ 
          isConnected: true, 
          details: `Connected to Uniswap V3 Subgraph. Latest block: ${data.data._meta.block.number}`
        });
      } else {
        setApiStatus({
          isConnected: false,
          details: `Error connecting to Uniswap: ${data?.errors?.[0]?.message || 'Unknown error'}`
        });
      }
    } catch (error: any) {
      console.error('Error checking API status:', error);
      setApiStatus({
        isConnected: false,
        details: `Exception: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAdmin) {
      checkApiStatus();
    }
  }, [isAdmin]);
  
  if (!isAdmin) {
    return null; // Don't render anything for non-admins
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Source Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium text-sm text-gray-700 mb-2">Uniswap V3 API Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                apiStatus.isConnected
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}></div>
              <span>
                {apiStatus.isConnected
                  ? 'Connected' 
                  : 'Not Connected'}
              </span>
            </div>
            {apiStatus.details && (
              <p className="text-xs text-gray-500 mt-1">{apiStatus.details}</p>
            )}
            <Button
              variant="ghost" 
              size="sm"
              onClick={checkApiStatus}
              disabled={isLoading}
              className="w-full mt-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium text-sm text-gray-700 mb-2">V3 Pool Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Pool Address:</span>
                <span className="font-mono">{UNISWAP_V3_POOL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chain:</span>
                <span className="font-medium">Polygon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subgraph:</span>
                <span className="font-mono truncate max-w-[200px]">{UNISWAP_V3_URL}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSourceDiagnostic;
