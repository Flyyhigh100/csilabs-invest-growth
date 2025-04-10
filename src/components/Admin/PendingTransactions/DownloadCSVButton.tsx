
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Columns2 } from 'lucide-react';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import { downloadPendingDistributionsCSV } from '@/utils/admin/exportUtils';

interface DownloadCSVButtonProps {
  transactions: PendingTransactionWithProfile[];
  selectedTransactions?: PendingTransactionWithProfile[];
}

const DownloadCSVButton: React.FC<DownloadCSVButtonProps> = ({ 
  transactions, 
  selectedTransactions 
}) => {
  const txsToExport = selectedTransactions?.length ? selectedTransactions : transactions;
  const isDisabled = txsToExport.length === 0;

  const handleDownloadDetailed = () => {
    downloadPendingDistributionsCSV(txsToExport, false);
  };
  
  const handleDownloadSimplified = () => {
    downloadPendingDistributionsCSV(txsToExport, true);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isDisabled}
          className="flex gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Download CSV</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDownloadSimplified} className="flex gap-2">
          <Columns2 className="h-4 w-4" />
          <span>Simplified Format (for Cryptosender)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadDetailed} className="flex gap-2">
          <FileText className="h-4 w-4" />
          <span>Detailed Format (all info)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadCSVButton;
