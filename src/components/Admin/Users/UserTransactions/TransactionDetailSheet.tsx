
import React from 'react';
import { formatCurrency } from '@/utils/format';
import { Transaction } from '@/types/transactions';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionDetailSheet: React.FC<TransactionDetailProps> = ({
  transaction,
  open,
  onOpenChange
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderDetailRow = (label: string, value: string | number | null | undefined, field: string) => {
    if (value === null || value === undefined) return null;
    
    return (
      <div className="flex flex-col space-y-1 py-2 border-b">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium break-all text-sm">{value}</span>
          <button 
            onClick={() => copyToClipboard(String(value), field)}
            className="text-gray-400 hover:text-gray-600"
            title="Copy to clipboard"
          >
            {copied === field ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Transaction Details</SheetTitle>
          <SheetDescription>
            ID: {transaction.transaction_id}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <div className="text-sm">
                {new Date(transaction.created_at).toLocaleString()}
              </div>
            </div>
            
            {renderDetailRow("Amount", formatCurrency(transaction.amount), "amount")}
            {renderDetailRow("Status", transaction.status, "status")}
            {renderDetailRow("Payment Method", transaction.payment_method, "paymentMethod")}
            {renderDetailRow("Payment Address", transaction.payment_address, "paymentAddress")}
            {renderDetailRow("External Transaction ID", transaction.external_transaction_id, "externalTransactionId")}
          </Card>
          
          <Card className="p-4 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Token Information</h3>
            {renderDetailRow("Wallet Address", transaction.wallet_address, "walletAddress")}
            {renderDetailRow("Token Amount", transaction.token_amount, "tokenAmount")}
            {renderDetailRow("Token Price", transaction.token_price ? `$${transaction.token_price}` : null, "tokenPrice")}
            {renderDetailRow("Token Sent", transaction.token_sent ? "Yes" : "No", "tokenSent")}
            {renderDetailRow("Blockchain Tx ID", transaction.blockchain_tx_id, "blockchainTxId")}
          </Card>
          
          <Card className="p-4 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            {renderDetailRow("Admin Notes", transaction.admin_notes || "No notes", "adminNotes")}
            {renderDetailRow("Approval Status", transaction.approval_status, "approvalStatus")}
            {renderDetailRow("High Value Approval Required", transaction.high_value_approval_required ? "Yes" : "No", "highValueApproval")}
          </Card>
          
          {transaction.blockchain_tx_id && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open(`https://polygonscan.com/tx/${transaction.blockchain_tx_id}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                View on Blockchain
              </Button>
            </div>
          )}
          
          <SheetClose asChild>
            <Button className="w-full" variant="outline">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionDetailSheet;
