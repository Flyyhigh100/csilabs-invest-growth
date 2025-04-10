
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import { downloadPendingDistributionsCSV } from '@/utils/admin/exportUtils';

interface DownloadCSVButtonProps {
  transactions: PendingTransactionWithProfile[];
}

const DownloadCSVButton: React.FC<DownloadCSVButtonProps> = ({ transactions }) => {
  const handleDownload = () => {
    downloadPendingDistributionsCSV(transactions);
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleDownload}
      disabled={transactions.length === 0}
      className="flex gap-2"
    >
      <Download className="h-4 w-4" />
      <span>Download CSV</span>
    </Button>
  );
};

export default DownloadCSVButton;
