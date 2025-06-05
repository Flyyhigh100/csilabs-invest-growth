
import { PendingTransactionWithProfile } from "@/hooks/admin/usePendingTransactions";

/**
 * Enhanced token amount calculation with production-safe fallbacks
 */
const calculateTokenAmount = (tx: PendingTransactionWithProfile): number => {
  // First priority: Use stored token amount from purchase time (most accurate)
  if (tx.token_amount && tx.token_amount > 0) {
    return tx.token_amount;
  }
  
  // Second priority: Calculate from stored token price (still accurate)
  if (tx.token_price && tx.token_price > 0) {
    return tx.amount / tx.token_price;
  }
  
  // Third priority: Use USD amount as fallback (legacy behavior)
  console.warn(`No token price data available for transaction ${tx.id}, using USD amount as fallback`);
  return tx.amount;
};

/**
 * Enhanced network detection and wallet address selection
 */
const getNetworkAndAddress = (tx: PendingTransactionWithProfile): { network: string; address: string } => {
  // Check if user has both addresses
  const polygonAddress = tx.profiles?.wallet_address;
  const solanaAddress = tx.profiles?.solana_wallet_address;
  
  // First, check if the transaction specifies a network preference
  if (tx.payment_method?.toLowerCase().includes('solana') || 
      tx.wallet_address?.startsWith('sol:') ||
      (tx.wallet_address && tx.wallet_address.length > 44)) { // Solana addresses are typically 44 chars
    return {
      network: 'Solana',
      address: solanaAddress || tx.wallet_address?.replace('sol:', '') || tx.wallet_address || ''
    };
  }
  
  // Check user's preferred network from profile
  if (tx.profiles?.preferred_network === 'solana' && solanaAddress) {
    return {
      network: 'Solana',
      address: solanaAddress
    };
  }
  
  // Default to Polygon if available, otherwise use what's available
  if (polygonAddress) {
    return {
      network: 'Polygon',
      address: polygonAddress
    };
  }
  
  if (solanaAddress) {
    return {
      network: 'Solana', 
      address: solanaAddress
    };
  }
  
  // Fallback to transaction wallet address
  return {
    network: 'Unknown',
    address: tx.wallet_address || ''
  };
};

/**
 * Creates and downloads a CSV file with pending token distribution data (detailed version)
 */
export const downloadPendingDistributionsCSV = (transactions: PendingTransactionWithProfile[], simplified = false): void => {
  // Define CSV headers based on format type
  const headers = simplified 
    ? ['Wallet Address', 'CSL Tokens', 'Network'] 
    : ['Date', 'User Name', 'Email', 'USD Amount', 'CSL Tokens', 'Token Price', 'Price Source', 'Polygon Address', 'Solana Address', 'Distribution Network', 'Distribution Address'];
  
  // Format transaction data for CSV with enhanced token calculation and network handling
  const rows = transactions.map(tx => {
    // Enhanced token amount calculation with source tracking
    const tokenAmount = calculateTokenAmount(tx);
    const hasStoredTokenData = !!(tx.token_amount && tx.token_price);
    const priceSource = hasStoredTokenData ? 'Purchase Time' : 'Fallback';
    
    // Get network and address information
    const { network, address } = getNetworkAndAddress(tx);
    
    const userName = tx.profiles ? 
      `${tx.profiles.first_name || ''} ${tx.profiles.last_name || ''}`.trim() : 
      'Unknown User';
      
    const email = tx.profiles?.email || '';
    const polygonAddress = tx.profiles?.wallet_address || '';
    const solanaAddress = tx.profiles?.solana_wallet_address || '';
    
    if (simplified) {
      // For simplified version - wallet, token amount, and network (for MultiSender)
      return [address, tokenAmount.toFixed(2), network];
    } else {
      // For detailed version - all fields including both addresses
      const date = new Date(tx.created_at).toLocaleDateString();
      const usdAmount = tx.amount.toFixed(2);
      const formattedTokenAmount = tokenAmount.toFixed(2);
      const tokenPrice = tx.token_price ? tx.token_price.toFixed(4) : 'N/A';
      
      return [
        date, 
        userName, 
        email, 
        usdAmount, 
        formattedTokenAmount, 
        tokenPrice, 
        priceSource, 
        polygonAddress,
        solanaAddress,
        network,
        address
      ];
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
 * Enhanced distribution statistics with improved token calculations
 */
export const getDistributionStats = (transactions: PendingTransactionWithProfile[]) => {
  // Calculate total USD amount
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Enhanced total token amount calculation
  const totalTokenAmount = transactions.reduce((sum, tx) => {
    const tokenAmount = calculateTokenAmount(tx);
    return sum + tokenAmount;
  }, 0);
  
  // Count transactions with stored vs calculated token data
  const transactionsWithStoredData = transactions.filter(tx => 
    tx.token_amount && tx.token_price
  ).length;
  
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
    solanaTransactions,
    // Additional stats for token data quality
    transactionsWithStoredData,
    dataQualityPercentage: transactions.length > 0 
      ? (transactionsWithStoredData / transactions.length) * 100 
      : 0
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
