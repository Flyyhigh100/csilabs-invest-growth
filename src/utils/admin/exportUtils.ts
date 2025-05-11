
import { PendingTransactionWithProfile } from "@/hooks/admin/usePendingTransactions";

/**
 * Creates and downloads a CSV file with pending token distribution data (detailed version)
 */
export const downloadPendingDistributionsCSV = (transactions: PendingTransactionWithProfile[], simplified = false): void => {
  // Define CSV headers based on format type
  const headers = simplified 
    ? ['Wallet Address', 'CSL Tokens'] 
    : ['Date', 'User Name', 'Email', 'USD Amount', 'CSL Tokens', 'Token Price', 'Wallet Address', 'Network'];
  
  // Format transaction data for CSV
  const rows = transactions.map(tx => {
    // Calculate token amount if not directly available
    const tokenAmount = tx.token_amount || 
      (tx.token_price && tx.token_price > 0 ? tx.amount / tx.token_price : tx.amount);
    
    // Determine if this is a Solana transaction based on available data
    const isSolanaWallet = tx.wallet_address?.startsWith('sol:') || 
                         tx.payment_method?.toLowerCase().includes('solana') ||
                         tx.wallet_address?.length > 42; // Simple heuristic, Solana addresses are longer
    
    const network = isSolanaWallet ? 'Solana' : 'Polygon';
    
    // Clean the wallet address (remove any network prefixes)
    const cleanWalletAddress = tx.wallet_address?.startsWith('sol:') 
      ? tx.wallet_address.substring(4) 
      : tx.wallet_address;
    
    if (simplified) {
      // For simplified version - just wallet and token amount (for MultiSender)
      return [cleanWalletAddress, tokenAmount.toFixed(2)];
    } else {
      // For detailed version - all fields
      const userName = tx.profiles ? 
        `${tx.profiles.first_name || ''} ${tx.profiles.last_name || ''}`.trim() : 
        'Unknown User';
        
      const email = tx.profiles?.email || '';
      const date = new Date(tx.created_at).toLocaleDateString();
      const usdAmount = tx.amount.toFixed(2);
      const formattedTokenAmount = tokenAmount.toFixed(2);
      const tokenPrice = tx.token_price ? tx.token_price.toFixed(2) : 'N/A';
      
      return [date, userName, email, usdAmount, formattedTokenAmount, tokenPrice, cleanWalletAddress, network];
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
  const filenameSuffix = simplified ? 'multisender-format' : 'detailed';
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
  // Calculate total USD amount
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Calculate total token amount
  const totalTokenAmount = transactions.reduce((sum, tx) => {
    const tokenAmount = tx.token_amount || 
      (tx.token_price && tx.token_price > 0 ? tx.amount / tx.token_price : tx.amount);
    return sum + tokenAmount;
  }, 0);
  
  // Count unique wallet addresses
  const uniqueWallets = new Set(transactions.map(tx => tx.wallet_address));
  const uniqueWalletCount = uniqueWallets.size;
  
  // Count transactions by network
  const polygonTransactions = transactions.filter(tx => 
    !tx.wallet_address?.startsWith('sol:') && 
    !tx.payment_method?.toLowerCase().includes('solana') &&
    !(tx.wallet_address?.length > 42) // Simple heuristic
  ).length;
  
  const solanaTransactions = transactions.length - polygonTransactions;
  
  // Calculate potential gas savings (estimate: 0.001 ETH per transaction saved)
  // We save (all transactions - unique wallets) * gas cost
  const transactionsSaved = Math.max(0, transactions.length - uniqueWalletCount);
  const estimatedGasSavings = transactionsSaved * 0.001;
  
  return {
    totalAmount,
    totalTokenAmount,
    totalTransactions: transactions.length,
    uniqueWalletCount,
    transactionsSaved,
    estimatedGasSavings,
    polygonTransactions,
    solanaTransactions
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
