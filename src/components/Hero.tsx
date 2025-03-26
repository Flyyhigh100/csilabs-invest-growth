import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, LineChart as LineChartIcon, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokenData } from '@/hooks/useTokenData';

// Chart configuration for styling
const chartConfig = {
  price: {
    label: "Price (USD)",
    theme: {
      light: "#0BC5EA",
      dark: "#0BC5EA"
    }
  },
  volume: {
    label: "Volume",
    theme: {
      light: "#1A365D",
      dark: "#1A365D"
    }
  }
};

// Custom tooltip component that satisfies Recharts' typing requirements
const CustomTooltip = (props: any) => {
  if (!props.active || !props.payload || props.payload.length === 0) {
    return null;
  }
  return <ChartTooltipContent {...props} />;
};

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { priceData, volumeData, currentPrice, tokenInfo, isLoading, hasError } = useTokenData();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Format the current price for display
  const formattedCurrentPrice = currentPrice 
    ? `$${currentPrice.toFixed(5)}` 
    : 'Loading...';

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cbis-teal opacity-5 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10 pt-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={`transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider uppercase rounded-full text-cbis-blue bg-blue-50 border border-blue-100">
              Harvard-Validated Research
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight text-cbis-dark">
              Revolutionizing <span className="bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent">Cancer Treatment</span> Through Innovation
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              CSi Labs is pioneering cannabinoid-based cancer treatments with Harvard-validated research. Invest in our token to help fund clinical trials and our FDA approval process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white hover:opacity-90 transition-opacity flex-shrink-0">
                <Link to="/register">
                  Buy Tokens <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-cbis-blue text-cbis-blue hover:bg-cbis-blue/5 transition-colors flex-shrink-0">
                <Link to="/token-info">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white p-2">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10">
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent mb-3">$CSi-EDP/Labs</div>
                    <p className="text-cbis-dark">CSi Labs Token (CSL)</p>
                    {currentPrice && (
                      <p className="text-lg font-medium mt-2">{formattedCurrentPrice}</p>
                    )}
                  </div>
                  
                  <Tabs defaultValue="price" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <TabsList className="grid grid-cols-2 w-40">
                        <TabsTrigger value="price">Price</TabsTrigger>
                        <TabsTrigger value="volume">Volume</TabsTrigger>
                      </TabsList>
                      <div className="flex items-center text-xs text-gray-500">
                        <Info className="h-3 w-3 mr-1" />
                        <span>Powered by Defined.fi</span>
                      </div>
                    </div>
                    
                    <TabsContent value="price" className="mt-0">
                      <div className="h-48 w-full">
                        {isLoading ? (
                          <div className="h-full w-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-cbis-blue animate-spin" />
                          </div>
                        ) : hasError ? (
                          <div className="h-full w-full flex items-center justify-center text-red-500">
                            Error loading data
                          </div>
                        ) : (
                          <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart data={priceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                              <YAxis 
                                tickFormatter={(value) => `$${value.toFixed(5)}`}
                                tick={{ fontSize: 10 }}
                                domain={['dataMin', 'dataMax']}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                name="price"
                                stroke="#0BC5EA" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                              />
                            </LineChart>
                          </ChartContainer>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="volume" className="mt-0">
                      <div className="h-48 w-full">
                        {isLoading ? (
                          <div className="h-full w-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-cbis-blue animate-spin" />
                          </div>
                        ) : hasError ? (
                          <div className="h-full w-full flex items-center justify-center text-red-500">
                            Error loading data
                          </div>
                        ) : (
                          <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart data={volumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                              <YAxis 
                                tickFormatter={(value) => value.toLocaleString()}
                                tick={{ fontSize: 10 }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="volume" 
                                name="volume"
                                stroke="#1A365D" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                              />
                            </LineChart>
                          </ChartContainer>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex flex-col gap-4 max-w-full mx-auto mt-6">
                    <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Supply:</span>
                      <span className="font-medium">{tokenInfo ? tokenInfo.totalSupply : 'Loading...'} CSL</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Blockchain:</span>
                      <span className="font-medium">{tokenInfo ? tokenInfo.blockchain : 'Loading...'}</span>
                    </div>
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Contract:</span>
                      </div>
                      <div className="text-gray-700 text-xs font-mono break-all overflow-hidden">
                        {tokenInfo ? tokenInfo.contractAddress : 'Loading...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
            <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
