import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNISWAP_V3_POOL } from '@/services/api/config';

const DataIntegrityNotice = () => {
  const handleViewOnDexScreener = () => {
    window.open(`https://dexscreener.com/polygon/${UNISWAP_V3_POOL}`, '_blank');
  };

  return (
    <Alert className="mb-4 border-primary/20 bg-primary/5">
      <Shield className="h-4 w-4" />
      <AlertTitle className="text-primary">Data Integrity Guarantee</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          All price data displayed is sourced directly from real blockchain APIs (DexScreener, The Graph Protocol).
          No simulated, mock, or artificially generated data is ever displayed.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewOnDexScreener}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Verify on DexScreener
          </Button>
          <span className="text-xs text-muted-foreground">
            Cross-reference our data with external sources
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DataIntegrityNotice;