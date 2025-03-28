
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface SellTokensTabProps {
  walletAddress: string | null;
}

const SellTokensTab: React.FC<SellTokensTabProps> = ({ walletAddress }) => {
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
    
    // This is just a simulation for testing
    toast.info("Processing sell request...");
    setTimeout(() => {
      toast.success("This is a test environment. In production, this would initiate a sell transaction.");
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell CSi Tokens</CardTitle>
        <CardDescription>Test the token selling functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle>Test Environment</AlertTitle>
          <AlertDescription>
            This is a test environment. No actual tokens will be sold. In production, this would connect to the Polygon network to process your transaction.
          </AlertDescription>
        </Alert>
        
        {!walletAddress ? (
          <Alert className="mb-4">
            <Info className="h-5 w-5" />
            <AlertTitle>Wallet Address Required</AlertTitle>
            <AlertDescription>
              Please add your Polygon wallet address above before proceeding.
            </AlertDescription>
          </Alert>
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
              Test Sell Transaction
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Note: In a production environment, you would be able to sell your CSi tokens for USD or cryptocurrency through our platform.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SellTokensTab;
