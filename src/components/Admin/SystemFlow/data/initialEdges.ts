
import { Edge } from '@xyflow/react';

export const initialEdges: Edge[] = [
  // Initial flow
  { id: 'e1', source: 'user-start', target: 'wallet-setup' },
  
  // Wallet Funding Flow - New connections for the revised flow
  { id: 'e2', source: 'wallet-setup', target: 'has-crypto' },
  { id: 'e3', source: 'has-crypto', target: 'fund-wallet', label: 'No' },
  { id: 'e4', source: 'has-crypto', target: 'token-purchase', label: 'Yes' },
  { id: 'e5', source: 'fund-wallet', target: 'token-purchase' },
  
  // Continue with token purchase flow
  { id: 'e6', source: 'token-purchase', target: 'acquisition-choice' },
  
  // Acquisition method selection
  { id: 'e7', source: 'acquisition-choice', target: 'coinpayments', label: 'Direct Purchase' },
  { id: 'e8', source: 'acquisition-choice', target: 'dex-path', label: 'DEX Purchase' },
  
  // DEX purchase completion
  { id: 'e9', source: 'dex-path', target: 'dex-purchase' },
  { id: 'e10', source: 'dex-purchase', target: 'dex-complete' },
  { id: 'e11', source: 'dex-purchase', target: 'notification', label: 'Purchase Completed' },
  
  // KYC flow for CoinPayments
  { id: 'e12', source: 'coinpayments', target: 'kyc-required' },
  { id: 'e13', source: 'kyc-required', target: 'kyc-submit', label: '$10,000+' },
  { id: 'e14', source: 'kyc-required', target: 'payment-pending', label: 'Under $10,000' },
  { id: 'e15', source: 'kyc-submit', target: 'kyc-review' },
  { id: 'e16', source: 'kyc-review', target: 'kyc-decision' },
  { id: 'e17', source: 'kyc-decision', target: 'kyc-clarification', label: 'Need Info' },
  { id: 'e18', source: 'kyc-clarification', target: 'kyc-submit' },
  { id: 'e19', source: 'kyc-decision', target: 'payment-pending', label: 'Approved' },
  { id: 'e20', source: 'kyc-decision', target: 'notification', label: 'Rejected' },
  
  // Payment processing for CoinPayments
  { id: 'e21', source: 'payment-pending', target: 'payment-confirm' },
  { id: 'e22', source: 'payment-pending', target: 'notification', label: 'Status Updates' },
  
  // Admin distribution for CoinPayments
  { id: 'e23', source: 'payment-confirm', target: 'admin-queue' },
  { id: 'e24', source: 'admin-queue', target: 'admin-send' },
  { id: 'e25', source: 'admin-send', target: 'tx-recording' },
  { id: 'e26', source: 'tx-recording', target: 'direct-complete' },
  { id: 'e27', source: 'tx-recording', target: 'notification', label: 'Completion Notice' },
];
