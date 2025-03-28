
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const SellTokensTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell CSi Tokens</CardTitle>
        <CardDescription>Coming soon</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-5 w-5" />
          <AlertTitle>Feature in Development</AlertTitle>
          <AlertDescription>
            Token selling functionality will be available after the initial offering period. Please check back later.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SellTokensTab;
