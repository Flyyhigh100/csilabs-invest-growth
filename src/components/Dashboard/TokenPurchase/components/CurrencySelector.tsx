
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCw } from "lucide-react";

interface CurrencySelectorProps {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  currencies: Record<string, any> | null;
  isLoading: boolean;
  isProcessing: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  setSelectedCurrency,
  currencies,
  isLoading,
  isProcessing,
  isRefreshing,
  onRefresh
}) => {
  const hasCurrencies = currencies && Object.keys(currencies).length > 0;

  const renderCurrencyOptions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner className="h-4 w-4 mr-2" />
          <span>Loading available currencies...</span>
        </div>
      );
    } 
    
    if (!hasCurrencies) {
      return (
        <div className="p-4 text-red-500 text-center">
          No currencies available
        </div>
      );
    }
    
    return Object.entries(currencies).map(([code, data]) => (
      <SelectItem 
        key={code} 
        value={code} 
        className="hover:bg-blue-50"
      >
        {data.name || code}
      </SelectItem>
    ));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <Label htmlFor="crypto-currency" className="text-sm text-gray-700 font-medium">
          Select Cryptocurrency
        </Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isLoading || isProcessing || isRefreshing}
          className="text-xs flex items-center gap-1"
        >
          {(isLoading || isRefreshing) ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </Button>
      </div>
      
      <Select 
        value={selectedCurrency} 
        onValueChange={setSelectedCurrency} 
        disabled={isProcessing || isLoading || !hasCurrencies}
      >
        <SelectTrigger 
          id="crypto-currency" 
          className="mt-2 border border-gray-200 bg-white focus:ring-2 focus:ring-cbis-blue focus:border-cbis-blue transition-all"
        >
          <SelectValue placeholder={isLoading ? "Loading currencies..." : "Select cryptocurrency"} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {renderCurrencyOptions()}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
