
import React, { useState } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import SyncWithStripeButton from './SyncWithStripeButton';
import { groupTransactionsByWallet } from '@/utils/admin/exportUtils';

interface TransactionsTableProps {
  transactions: PendingTransactionWithProfile[];
  onMarkAsSent: (tx: PendingTransactionWithProfile) => void;
  onTransactionUpdated?: () => void;
  selectedTransactions: PendingTransactionWithProfile[];
  onSelectTransaction: (tx: PendingTransactionWithProfile, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

const TransactionsTable = ({ 
  transactions, 
  onMarkAsSent,
  onTransactionUpdated,
  selectedTransactions,
  onSelectTransaction,
  onSelectAll
}: TransactionsTableProps) => {
  // Group transactions by wallet
  const walletGroups = groupTransactionsByWallet(transactions);
  const walletGroupsArray = Array.from(walletGroups.entries());
  
  // Check if all transactions are selected
  const allSelected = transactions.length > 0 && selectedTransactions.length === transactions.length;
  
  // Calculate wallet totals
  const getWalletTotal = (txs: PendingTransactionWithProfile[]) => {
    return txs.reduce((sum, tx) => sum + tx.amount, 0);
  };
  
  // Calculate grand total
  const grandTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Helper function to safely get user name from profiles
  const getUserName = (tx: PendingTransactionWithProfile): string => {
    if (!tx.profiles) return 'Unknown User';
    
    const firstName = tx.profiles.first_name || '';
    const lastName = tx.profiles.last_name || '';
    
    if (!firstName && !lastName) return 'Unknown User';
    return `${firstName} ${lastName}`.trim();
  };
  
  // Helper function to safely get email from profiles
  const getUserEmail = (tx: PendingTransactionWithProfile): string => {
    return tx.profiles?.email || 'No email available';
  };

  // Handle sync completion
  const handleSyncComplete = () => {
    if (onTransactionUpdated) {
      onTransactionUpdated();
    }
  };
  
  const isSelected = (tx: PendingTransactionWithProfile) => {
    return selectedTransactions.some(selected => selected.id === tx.id);
  };
  
  const getPolygonScanUrl = (txId: string) => {
    return `https://polygonscan.com/tx/${txId}`;
  };
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected} 
                onCheckedChange={onSelectAll}
                disabled={transactions.length === 0}
              />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No pending token distributions found
              </TableCell>
            </TableRow>
          ) : (
            walletGroupsArray.map(([walletAddress, txs]) => (
              <React.Fragment key={walletAddress}>
                {txs.map((tx, index) => (
                  <TableRow 
                    key={tx.id}
                    className={index > 0 ? "border-t-0 border-dashed" : ""}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={isSelected(tx)} 
                        onCheckedChange={(checked) => onSelectTransaction(tx, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getUserName(tx)}
                      </div>
                      <div className="text-xs text-gray-500">{getUserEmail(tx)}</div>
                    </TableCell>
                    <TableCell>${tx.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs max-w-[150px] truncate">
                        {txs.length > 1 && index === 0 ? (
                          <Badge variant="outline" className="mr-1">x{txs.length}</Badge>
                        ) : txs.length > 1 ? (
                          <Badge variant="outline" className="mr-1 opacity-50">↑</Badge>
                        ) : null}
                        {tx.wallet_address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Distribution
                      </Badge>
                      {tx.status === 'pending' && tx.payment_method === 'stripe' && (
                        <div className="mt-1">
                          <SyncWithStripeButton 
                            transaction={tx} 
                            onSyncComplete={handleSyncComplete}
                            size="sm" 
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm"
                        onClick={() => onMarkAsSent(tx)}
                      >
                        Mark as Sent
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Add wallet total row */}
                {txs.length > 1 && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={3} className="font-medium text-right">
                      Wallet Total
                    </TableCell>
                    <TableCell colSpan={4} className="font-medium">
                      ${getWalletTotal(txs).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
          {/* Grand total row */}
          {transactions.length > 0 && (
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell colSpan={3} className="text-right">
                Grand Total
              </TableCell>
              <TableCell colSpan={4}>
                ${grandTotal.toFixed(2)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default TransactionsTable;
