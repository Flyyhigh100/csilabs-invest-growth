
import { PendingTransactionWithProfile } from "@/hooks/admin/usePendingTransactions";

/**
 * Creates and downloads a CSV file with pending token distribution data (detailed version)
 */
export const downloadPendingDistributionsCSV = (transactions: PendingTransactionWithProfile[], simplified = false): void => {
  // Define CSV headers based on format type
  const headers = simplified 
    ? ['Wallet Address', 'Amount'] 
    : ['Date', 'User Name', 'Email', 'Amount', 'Wallet Address'];
  
  // Format transaction data for CSV
  const rows = transactions.map(tx => {
    if (simplified) {
      // For simplified version - just wallet and amount
      return [tx.wallet_address, tx.amount.toFixed(2)];
    } else {
      // For detailed version - all fields
      const userName = tx.profiles ? 
        `${tx.profiles.first_name || ''} ${tx.profiles.last_name || ''}`.trim() : 
        'Unknown User';
        
      const email = tx.profiles?.email || '';
      const date = new Date(tx.created_at).toLocaleDateString();
      const amount = tx.amount.toFixed(2);
      
      return [date, userName, email, amount, tx.wallet_address];
    }
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create a Blob containing the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Set filename based on format type
  const filenameSuffix = simplified ? 'simplified' : 'detailed';
  link.setAttribute('download', `pending-distributions-${filenameSuffix}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = 'none';
  
  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the object URL to free up memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Returns distribution statistics for the pending transactions
 */
export const getDistributionStats = (transactions: PendingTransactionWithProfile[]) => {
  // Calculate total amount
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Count unique wallet addresses
  const uniqueWallets = new Set(transactions.map(tx => tx.wallet_address));
  const uniqueWalletCount = uniqueWallets.size;
  
  // Calculate potential gas savings (estimate: 0.001 ETH per transaction saved)
  // We save (all transactions - unique wallets) * gas cost
  const transactionsSaved = Math.max(0, transactions.length - uniqueWalletCount);
  const estimatedGasSavings = transactionsSaved * 0.001;
  
  return {
    totalAmount,
    totalTransactions: transactions.length,
    uniqueWalletCount,
    transactionsSaved,
    estimatedGasSavings
  };
};

/**
 * Groups transactions by wallet address
 */
export const groupTransactionsByWallet = (transactions: PendingTransactionWithProfile[]) => {
  const walletGroups = new Map<string, PendingTransactionWithProfile[]>();
  
  transactions.forEach(tx => {
    if (!walletGroups.has(tx.wallet_address)) {
      walletGroups.set(tx.wallet_address, []);
    }
    walletGroups.get(tx.wallet_address)?.push(tx);
  });
  
  return walletGroups;
};
