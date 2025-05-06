import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { TOKEN_ADDRESS, CHAIN_ID, UNISWAP_V3_POOL } from '@/services/api/config';
import { RefreshCw, AlertCircle, Clock, Info, ExternalLink, Server, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

export const PriceDebugger = () => {
  const { 
    currentPrice, 
    error, 
    lastUpdated, 
    timeUntilNextUpdate, 
    refreshPrice, 
    dataSource 
  } = useTokenPrice();
  
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState<boolean>(false);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const isDemoData = error !== null;
  
  // Function to check if current user is an admin
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

  // Helper function to get source display name
  const getSourceDisplayName = (source: string | null) => {
    switch(source) {
      case 'on-chain-v3': return "Uniswap V3 TWAP";
      case 'defined.fi': return "Defined.fi API";
      case 'dexscreener': return "DexScreener API";
      case 'cache': return "Cached Data";
      default: return "Unknown Source";
    }
  };

  // Helper function to get badge variant based on source
  const getSourceBadgeVariant = (source: string | null) => {
    switch(source) {
      case 'on-chain-v3':
        return "success";
      case 'defined.fi':
      case 'dexscreener':
        return "warning";
      case 'cache':
        return "outline";
      default:
        return "default";
    }
  };

  // Fetch diagnostics data from edge function
  const fetchDiagnostics = async () => {
    if (!isAdmin) {
      setDiagnosticsError("Only admins can access diagnostic information");
      return;
    }
    
    setIsLoadingDiagnostics(true);
    setDiagnosticsError(null);
    
    try {
      const response = await fetch('https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/internal-twap-status/diagnostics', {
        headers: {
          'x-admin-access': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching diagnostics: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDiagnosticsData(data);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      setDiagnosticsError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };
  
  // Fetch diagnostics on initial load if admin
  useEffect(() => {
    if (isAdmin) {
      fetchDiagnostics();
      
      // Also set up interval to refresh diagnostics
      const intervalId = setInterval(fetchDiagnostics, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isAdmin]);
  
  // Non-admin view - basic information
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Token Price Information</span>
          </CardTitle>
          <CardDescription>
            Current token price information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Current Price:</span>
              <span className="font-mono">${currentPrice?.toFixed(8) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Last Updated:</span>
              <span className="font-mono">{lastUpdated?.toLocaleString() || 'Never'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Data Source:</span>
              <Badge variant={getSourceBadgeVariant(dataSource)}>
                {getSourceDisplayName(dataSource)}
              </Badge>
            </div>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200 mt-4">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Detailed diagnostic information is only available to administrators.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Admin view with detailed diagnostics
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Price Debug Information</span>
          {isDemoData && (
            <Badge variant="destructive">Using Demo Data</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Debug information for price updates (Admin Only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="api-status">API Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Price:</span>
                <span className="font-mono">${currentPrice?.toFixed(8) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Updated:</span>
                <span className="font-mono">{lastUpdated?.toLocaleString() || 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Next Update In:</span>
                <span className="font-mono">{Math.ceil(timeUntilNextUpdate / 1000)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Data Source:</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Badge variant={getSourceBadgeVariant(dataSource)}>
                          {getSourceDisplayName(dataSource)}
                        </Badge>
                        <Info className="h-3.5 w-3.5 ml-1 opacity-70" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" align="center">
                      <p className="text-xs max-w-xs">
                        {dataSource === 'on-chain-v3' ? 
                          'Price data comes directly from the blockchain - highest reliability' :
                          dataSource === 'defined.fi' || dataSource === 'dexscreener' ?
                          'Price data comes from third-party API - medium reliability' :
                          dataSource === 'cache' ?
                          'Using cached price data - may be outdated' :
                          'Source information unavailable'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => refreshPrice()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Refresh Price
                </Button>
              </div>
              
              <Alert className={`mt-4 ${
                dataSource === 'on-chain-v3' ? 'bg-green-50 border-green-200' :
                dataSource === 'defined.fi' || dataSource === 'dexscreener' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <AlertDescription className="text-xs">
                  <div className="space-y-1">
                    <p><strong>Token Address:</strong> {TOKEN_ADDRESS}</p>
                    <p><strong>Chain ID:</strong> {CHAIN_ID}</p>
                    <p><strong>V3 Pool Address:</strong> {UNISWAP_V3_POOL}</p>
                    <p><strong>Cache Duration:</strong> 60s</p>
                    <p><strong>Primary Data Source:</strong> {getSourceDisplayName(dataSource)}</p>
                    <p><strong>Fallback Order:</strong> V3 TWAP → V3 Spot → Defined.fi → DexScreener</p>
                  </div>
                </AlertDescription>
              </Alert>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Error Details
                  </h4>
                  <p className="text-xs text-red-600">{error.message}</p>
                  <p className="text-xs text-red-500 mt-2">Check API connection in the Diagnostics tab</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Uniswap V3 Diagnostics</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchDiagnostics}
                  disabled={isLoadingDiagnostics}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingDiagnostics ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {isLoadingDiagnostics && <p className="text-sm text-gray-500">Loading diagnostics...</p>}
              
              {diagnosticsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load diagnostics: {diagnosticsError}
                  </AlertDescription>
                </Alert>
              )}
              
              {diagnosticsData && (
                <div className="space-y-2 bg-gray-50 p-4 rounded-md text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Last Attempt:</span>
                    <span>{new Date(diagnosticsData.lastAttempt).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Source:</span>
                    <Badge variant={getSourceBadgeVariant(diagnosticsData.source)}>
                      {diagnosticsData.source || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Last Price:</span>
                    <span>{diagnosticsData.lastPrice ? `$${Number(diagnosticsData.lastPrice).toFixed(8)}` : 'N/A'}</span>
                  </div>
                  
                  {diagnosticsData.lastError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
                      <p className="text-xs text-red-600 font-mono break-all">{diagnosticsData.lastError}</p>
                    </div>
                  )}
                  
                  {diagnosticsData.diagnostics && (
                    <Accordion type="single" collapsible className="mt-4">
                      <AccordionItem value="technical-details">
                        <AccordionTrigger className="text-sm">
                          Technical Details
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 p-2 bg-gray-100 rounded-md text-xs font-mono overflow-x-auto">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(diagnosticsData.diagnostics, null, 2)}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Debug Settings</h3>
                <p className="text-xs text-gray-500 mb-2">
                  Current DEBUG_TWAP value: <Badge>{import.meta.env.VITE_DEBUG_TWAP === 'true' ? 'Enabled' : 'Disabled'}</Badge>
                </p>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-xs">
                    Debug mode is {import.meta.env.VITE_DEBUG_TWAP === 'true' ? 'enabled' : 'disabled'}.
                    Extended debug logs will {import.meta.env.VITE_DEBUG_TWAP === 'true' ? 'appear' : 'not appear'} in your browser console.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api-status">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Server className="h-4 w-4 mr-1" />
                  API Endpoints
                </h3>
                
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uniswap V3 Subgraph:</span>
                      <a 
                        href="https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs flex items-center"
                      >
                        View <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <code className="text-xs bg-gray-100 p-1.5 mt-1 rounded-sm overflow-x-auto">
                      https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon
                    </code>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">V3 Pool ID:</span>
                      <a 
                        href={`https://app.uniswap.org/explore/polygon/pool/${UNISWAP_V3_POOL}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs flex items-center"
                      >
                        Explore <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <code className="text-xs bg-gray-100 p-1.5 mt-1 rounded-sm overflow-x-auto">
                      {UNISWAP_V3_POOL}
                    </code>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Diagnostics API:</span>
                      <a 
                        href="https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/internal-twap-status" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs flex items-center"
                      >
                        Test <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <code className="text-xs bg-gray-100 p-1.5 mt-1 rounded-sm">
                      https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/internal-twap-status
                    </code>
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Admin access required to view full diagnostic information.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceDebugger;
