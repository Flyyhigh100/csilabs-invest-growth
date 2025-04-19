
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
    id: 'token-purchase',
    data: { label: 'Select Token Purchase Amount' },
    position: { x: 0, y: 100 },
    className: 'bg-background border-2'
  },
  
  // Payment Flow
  {
    id: 'payment-choice',
    data: { label: 'Choose Payment Method' },
    position: { x: 0, y: 200 },
    className: 'bg-background border-2'
  },
  {
    id: 'crypto-payment',
    data: { label: 'CoinPayments.net\n(USDT, USDC)' },
    position: { x: -200, y: 300 },
    className: 'bg-background border-2'
  },
  {
    id: 'card-payment',
    data: { label: 'Stripe\n(Credit/Debit Card)' },
    position: { x: 200, y: 300 },
    className: 'bg-background border-2'
  },
  
  // KYC Flow
  {
    id: 'kyc-required',
    data: { label: 'KYC Required?\n($3,001 or higher)' },
    position: { x: 0, y: 400 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'kyc-submit',
    data: { label: 'Submit KYC Documents\n(ID & Address Verification)' },
    position: { x: -200, y: 500 },
    className: 'bg-background border-2'
  },
  {
    id: 'kyc-review',
    data: { label: 'Admin KYC Review' },
    position: { x: -200, y: 600 },
    className: 'bg-background border-2 border-destructive'
  },
  
  // Payment & Admin Flow
  {
    id: 'payment-confirm',
    data: { label: 'Payment Confirmed' },
    position: { x: 200, y: 500 },
    className: 'bg-background border-2 border-success'
  },
  {
    id: 'admin-send',
    data: { label: 'Admin Token Distribution' },
    position: { x: 0, y: 700 },
    className: 'bg-background border-2 border-destructive'
  },
  {
    id: 'complete',
    type: 'output',
    data: { label: 'Tokens Received' },
    position: { x: 0, y: 800 },
    className: 'bg-background border-2 border-success'
  },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'user-start', target: 'token-purchase' },
  { id: 'e2', source: 'token-purchase', target: 'payment-choice' },
  { id: 'e3', source: 'payment-choice', target: 'crypto-payment', label: 'Crypto' },
  { id: 'e4', source: 'payment-choice', target: 'card-payment', label: 'Card' },
  { id: 'e5', source: 'crypto-payment', target: 'kyc-required' },
  { id: 'e6', source: 'card-payment', target: 'kyc-required' },
  { id: 'e7', source: 'kyc-required', target: 'kyc-submit', label: '$3,001+' },
  { id: 'e8', source: 'kyc-required', target: 'payment-confirm', label: 'Under $3,001' },
  { id: 'e9', source: 'kyc-submit', target: 'kyc-review' },
  { id: 'e10', source: 'kyc-review', target: 'payment-confirm', label: 'Approved' },
  { id: 'e11', source: 'payment-confirm', target: 'admin-send' },
  { id: 'e12', source: 'admin-send', target: 'complete' },
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
