
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
  {
    id: 'token-purchase',
    data: { label: 'Select Token Purchase Amount' },
    position: { x: 0, y: 200 },
    className: 'bg-background border-2'
  },
  
  // Payment Method Selection
  {
    id: 'payment-choice',
    data: { label: 'Choose Payment Method' },
    position: { x: 0, y: 300 },
    className: 'bg-background border-2'
  },
  {
    id: 'coinpayments',
    data: { label: 'CoinPayments\n(USDT, USDC)' },
    position: { x: -200, y: 400 },
    className: 'bg-background border-2'
  },
  {
    id: 'stripe-crypto',
    data: { label: 'Stripe Crypto Onramp' },
    position: { x: 0, y: 400 },
    className: 'bg-background border-2'
  },
  {
    id: 'card-payment',
    data: { label: 'Card Payment\n(Credit/Debit)' },
    position: { x: 200, y: 400 },
    className: 'bg-background border-2'
  },
  
  // KYC Flow
  {
    id: 'kyc-required',
    data: { label: 'KYC Required?\n($10,000+ purchase)' },
    position: { x: 0, y: 500 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'kyc-submit',
    data: { label: 'Submit KYC Documents\n(ID & Address Verification)' },
    position: { x: -200, y: 600 },
    className: 'bg-background border-2'
  },
  {
    id: 'kyc-review',
    data: { label: 'Admin KYC Review' },
    position: { x: -200, y: 700 },
    className: 'bg-background border-2 border-destructive'
  },
  {
    id: 'kyc-decision',
    data: { label: 'KYC Decision' },
    position: { x: -200, y: 800 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'kyc-clarification',
    data: { label: 'Request Clarification' },
    position: { x: -350, y: 700 },
    className: 'bg-background border-2 border-warning'
  },
  
  // Payment Processing
  {
    id: 'payment-pending',
    data: { label: 'Payment Processing' },
    position: { x: 200, y: 600 },
    className: 'bg-background border-2'
  },
  {
    id: 'payment-confirm',
    data: { label: 'Payment Confirmed' },
    position: { x: 200, y: 700 },
    className: 'bg-background border-2 border-success'
  },
  
  // Admin Token Distribution
  {
    id: 'admin-queue',
    data: { label: 'Token Distribution Queue' },
    position: { x: 0, y: 900 },
    className: 'bg-background border-2'
  },
  {
    id: 'admin-send',
    data: { label: 'Admin Token Distribution' },
    position: { x: 0, y: 1000 },
    className: 'bg-background border-2 border-destructive'
  },
  {
    id: 'tx-recording',
    data: { label: 'Record Blockchain TX ID' },
    position: { x: 0, y: 1100 },
    className: 'bg-background border-2'
  },
  {
    id: 'complete',
    type: 'output',
    data: { label: 'Tokens Received' },
    position: { x: 0, y: 1200 },
    className: 'bg-background border-2 border-success'
  },
  
  // User Notification System
  {
    id: 'notification',
    data: { label: 'User Notification' },
    position: { x: 350, y: 800 },
    className: 'bg-background border-2 border-info'
  },
];

const initialEdges: Edge[] = [
  // Initial flow
  { id: 'e1', source: 'user-start', target: 'wallet-setup' },
  { id: 'e2', source: 'wallet-setup', target: 'token-purchase' },
  { id: 'e3', source: 'token-purchase', target: 'payment-choice' },
  
  // Payment method selection
  { id: 'e4', source: 'payment-choice', target: 'coinpayments', label: 'Crypto' },
  { id: 'e5', source: 'payment-choice', target: 'stripe-crypto', label: 'Crypto Onramp' },
  { id: 'e6', source: 'payment-choice', target: 'card-payment', label: 'Card' },
  
  // All payment methods flow to KYC check
  { id: 'e7', source: 'coinpayments', target: 'kyc-required' },
  { id: 'e8', source: 'stripe-crypto', target: 'kyc-required' },
  { id: 'e9', source: 'card-payment', target: 'kyc-required' },
  
  // KYC flow
  { id: 'e10', source: 'kyc-required', target: 'kyc-submit', label: '$10,000+' },
  { id: 'e11', source: 'kyc-required', target: 'payment-pending', label: 'Under $10,000' },
  { id: 'e12', source: 'kyc-submit', target: 'kyc-review' },
  { id: 'e13', source: 'kyc-review', target: 'kyc-decision' },
  { id: 'e14', source: 'kyc-decision', target: 'kyc-clarification', label: 'Need Info' },
  { id: 'e15', source: 'kyc-clarification', target: 'kyc-submit' },
  { id: 'e16', source: 'kyc-decision', target: 'payment-pending', label: 'Approved' },
  { id: 'e17', source: 'kyc-decision', target: 'notification', label: 'Rejected' },
  
  // Payment processing
  { id: 'e18', source: 'payment-pending', target: 'payment-confirm' },
  { id: 'e19', source: 'payment-pending', target: 'notification', label: 'Status Updates' },
  
  // Admin distribution
  { id: 'e20', source: 'payment-confirm', target: 'admin-queue' },
  { id: 'e21', source: 'admin-queue', target: 'admin-send' },
  { id: 'e22', source: 'admin-send', target: 'tx-recording' },
  { id: 'e23', source: 'tx-recording', target: 'complete' },
  { id: 'e24', source: 'tx-recording', target: 'notification', label: 'Completion Notice' },
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
