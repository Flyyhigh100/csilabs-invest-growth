
import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [
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

const SystemFlowChart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      className="bg-muted"
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default SystemFlowChart;
