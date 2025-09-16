import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNISWAP_V3_POOL } from '@/services/api/config';
const DataIntegrityNotice = () => {
  const handleViewOnDexTools = () => {
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${UNISWAP_V3_POOL}`, '_blank');
  };
  return <Alert className="border-primary/20 bg-primary/5">
      <Shield className="h-4 w-4" />
      <AlertTitle>Price Data Verification</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>For accurate price history, charts, and trends, information is available directly on DexTools.</p>
        <Button variant="outline" size="sm" onClick={handleViewOnDexTools} className="gap-2">
          <ExternalLink className="h-3 w-3" />
          View on DexTools
        </Button>
      </AlertDescription>
    </Alert>;
};
export default DataIntegrityNotice;