import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNISWAP_V3_POOL } from '@/services/api/config';
const DataIntegrityNotice = () => {
  const handleViewOnDexTools = () => {
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${UNISWAP_V3_POOL}`, '_blank');
  };
  return;
};
export default DataIntegrityNotice;