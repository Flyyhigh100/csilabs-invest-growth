
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Settings } from 'lucide-react';

const ConfigurationTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Price Configuration
        </CardTitle>
        <CardDescription>
          Configure token price settings for the payment system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="refresh-interval">Auto-refresh Interval (seconds)</Label>
            <Input 
              id="refresh-interval" 
              type="number" 
              min="5" 
              max="300" 
              value="30" 
              disabled={true}
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Modify in TokenPriceContext.tsx</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price-deviation">Max Price Deviation (%)</Label>
            <Input 
              id="price-deviation" 
              type="number" 
              min="1" 
              max="50" 
              value="20"
              disabled={true}
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Modify in priceService.ts</p>
          </div>
        </div>
        
        <div className="pt-4">
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Current pricing configuration can only be modified in the source code.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled className="w-full sm:w-auto">
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfigurationTab;
