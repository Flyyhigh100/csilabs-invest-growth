
import React from 'react';
import { Transaction } from "@/types/transactions";
import StatusBadge from './StatusBadge';
import PaymentMethodIcon from './PaymentMethodIcon';
import { formatCurrency } from '@/utils/format';
import SyncStripePaymentButton from './SyncStripePaymentButton';
import SyncCryptoPaymentButton from './SyncCryptoPaymentButton';

interface TransactionsTableProps {
  transactions: Transaction[];
  expandedItem: string | null;
  setExpandedItem: (id: string | null) => void;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
  isAdminView?: boolean;
}

const TransactionsTable = ({
  transactions,
  expandedItem,
  setExpandedItem,
  onSyncComplete,
  isAdminView = false
}: TransactionsTableProps) => {
  const handleRowClick = (txId: string) => {
    if (expandedItem === txId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(txId);
    }
  };

  return (
    <div className="overflow-hidden border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {isAdminView && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr 
              key={tx.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleRowClick(tx.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(tx.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(tx.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <PaymentMethodIcon method={tx.payment_method} />
                  <span className="capitalize">{tx.payment_method}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <StatusBadge transaction={tx} />
                  {/* Sync buttons for Stripe and Crypto payments */}
                  {tx.status === 'pending' && tx.payment_method === 'stripe' && (
                    <SyncStripePaymentButton 
                      transaction={tx} 
                      onSyncComplete={onSyncComplete} 
                      size="sm" 
                    />
                  )}
                  {tx.status === 'pending' && tx.payment_method === 'coinpayments' && (
                    <SyncCryptoPaymentButton 
                      transaction={tx} 
                      onSyncComplete={onSyncComplete} 
                      size="sm" 
                    />
                  )}
                </div>
              </td>
              {isAdminView && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* @ts-ignore - Handle the profiles relationship data */}
                  {tx.profiles?.email || 'Unknown user'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
