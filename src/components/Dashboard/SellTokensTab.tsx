
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface SellTokensTabProps {
  walletAddress: string | null;
}

const SellTokensTab: React.FC<SellTokensTabProps> = ({ walletAddress }) => {
  // This component is kept but not linked from any UI element
  // Necessary to maintain for potential future use
  
  const [amount, setAmount] = useState<number>(0);
  
  const handleSellTokens = () => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding");
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Production functionality would be implemented here
    toast.info("Processing sell request...");
    setTimeout(() => {
      toast.success("Your sell request has been submitted for processing.");
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell CSi Tokens</CardTitle>
        <CardDescription>Exchange your CSi tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!walletAddress ? (
          <div className="text-center p-4 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-blue-700 font-medium">
              Please add your Polygon wallet address above before proceeding.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Tokens to Sell</Label>
              <Input
                id="sell-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                min={1}
                step={1}
              />
              <p className="text-sm text-muted-foreground">
                Enter the number of CSi tokens you want to sell
              </p>
            </div>
            
            <Button onClick={handleSellTokens} className="w-full">
              Submit Sell Request
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Sell requests are processed within 1-2 business days.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SellTokensTab;
