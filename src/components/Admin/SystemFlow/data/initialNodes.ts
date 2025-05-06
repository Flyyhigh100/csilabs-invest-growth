
import { Node } from '@xyflow/react';

export const initialNodes: Node[] = [
  // User Flow Start
  {
    id: 'user-start',
    type: 'input',
    data: { label: 'User Visit' },
    position: { x: 0, y: 0 },
    className: 'bg-background border-2 border-primary'
  },
  {
    id: 'wallet-setup',
    data: { label: 'Configure Wallet Address' },
    position: { x: 0, y: 100 },
    className: 'bg-background border-2'
  },
  
  // Wallet Funding Flow - Moved up in the process
  {
    id: 'has-crypto',
    data: { label: 'Has Crypto in Wallet?' },
    position: { x: 0, y: 200 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'fund-wallet',
    data: { label: 'Fund Wallet with Stripe Crypto Onramp' },
    position: { x: 200, y: 300 },
    className: 'bg-background border-2'
  },
  
  // Token Purchase Selection
  {
    id: 'token-purchase',
    data: { label: 'Select Token Purchase Amount' },
    position: { x: 0, y: 400 },
    className: 'bg-background border-2'
  },
  
  // Acquisition Method Selection
  {
    id: 'acquisition-choice',
    data: { label: 'Choose Acquisition Method' },
    position: { x: 0, y: 500 },
    className: 'bg-background border-2'
  },
  {
    id: 'coinpayments',
    data: { label: 'Direct Purchase via CoinPayments' },
    position: { x: -250, y: 600 },
    className: 'bg-background border-2'
  },
  {
    id: 'dex-path',
    data: { label: 'Purchase on DEX' },
    position: { x: 250, y: 600 },
    className: 'bg-background border-2'
  },
  
  // DEX Purchase Completion
  {
    id: 'dex-purchase',
    data: { label: 'Complete Purchase on DEX' },
    position: { x: 250, y: 700 },
    className: 'bg-background border-2'
  },
  
  // KYC Flow
  {
    id: 'kyc-required',
    data: { label: 'KYC Required?\n($10,000+ purchase)' },
    position: { x: -250, y: 700 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'kyc-submit',
    data: { label: 'Submit KYC Documents\n(ID & Address Verification)' },
    position: { x: -400, y: 800 },
    className: 'bg-background border-2'
  },
  {
    id: 'kyc-review',
    data: { label: 'Admin KYC Review' },
    position: { x: -400, y: 900 },
    className: 'bg-background border-2 border-destructive'
  },
  {
    id: 'kyc-decision',
    data: { label: 'KYC Decision' },
    position: { x: -400, y: 1000 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'kyc-clarification',
    data: { label: 'Request Clarification' },
    position: { x: -550, y: 900 },
    className: 'bg-background border-2 border-warning'
  },
  
  // Payment Processing for CoinPayments
  {
    id: 'payment-pending',
    data: { label: 'Payment Processing' },
    position: { x: -250, y: 800 },
    className: 'bg-background border-2'
  },
  {
    id: 'payment-confirm',
    data: { label: 'Payment Confirmed' },
    position: { x: -250, y: 900 },
    className: 'bg-background border-2 border-success'
  },
  
  // Admin Token Distribution
  {
    id: 'admin-queue',
    data: { label: 'Token Distribution Queue' },
    position: { x: -250, y: 1000 },
    className: 'bg-background border-2'
  },
  {
    id: 'admin-send',
    data: { label: 'Admin Token Distribution' },
    position: { x: -250, y: 1100 },
    className: 'bg-background border-2 border-destructive'
  },
  {
    id: 'tx-recording',
    data: { label: 'Record Blockchain TX ID' },
    position: { x: -250, y: 1200 },
    className: 'bg-background border-2'
  },
  {
    id: 'direct-complete',
    data: { label: 'Tokens Received\n(CoinPayments Path)' },
    position: { x: -250, y: 1300 },
    className: 'bg-background border-2 border-success'
  },
  {
    id: 'dex-complete',
    type: 'output',
    data: { label: 'Tokens Acquired\n(DEX Path)' },
    position: { x: 250, y: 800 },
    className: 'bg-background border-2 border-success'
  },
  
  // User Notification System
  {
    id: 'notification',
    data: { label: 'User Notification' },
    position: { x: 0, y: 1000 },
    className: 'bg-background border-2 border-info'
  },
];
