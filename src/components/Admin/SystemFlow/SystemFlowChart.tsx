
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
  // User Flow
  {
    id: 'user-start',
    type: 'input',
    data: { label: 'User Visit' },
    position: { x: 0, y: 0 },
    className: 'bg-background border-2 border-primary'
  },
  {
    id: 'token-purchase',
    data: { label: 'Select Token Purchase' },
    position: { x: 0, y: 100 },
    className: 'bg-background border-2'
  },
  {
    id: 'payment-choice',
    data: { label: 'Choose Payment Method' },
    position: { x: 0, y: 200 },
    className: 'bg-background border-2'
  },
  {
    id: 'crypto-payment',
    data: { label: 'Crypto Payment' },
    position: { x: -150, y: 300 },
    className: 'bg-background border-2'
  },
  {
    id: 'card-payment',
    data: { label: 'Card Payment' },
    position: { x: 150, y: 300 },
    className: 'bg-background border-2'
  },
  
  // KYC Flow
  {
    id: 'kyc-required',
    data: { label: 'KYC Required?' },
    position: { x: 0, y: 400 },
    className: 'bg-background border-2 border-warning'
  },
  {
    id: 'kyc-submit',
    data: { label: 'Submit KYC' },
    position: { x: -150, y: 500 },
    className: 'bg-background border-2'
  },
  {
    id: 'kyc-review',
    data: { label: 'Admin KYC Review' },
    position: { x: -150, y: 600 },
    className: 'bg-background border-2 border-destructive'
  },
  
  // Admin Flow
  {
    id: 'payment-confirm',
    data: { label: 'Payment Confirmed' },
    position: { x: 150, y: 500 },
    className: 'bg-background border-2 border-success'
  },
  {
    id: 'admin-send',
    data: { label: 'Admin Sends Tokens' },
    position: { x: 0, y: 700 },
    className: 'bg-background border-2 border-destructive'
  },
  {
    id: 'complete',
    type: 'output',
    data: { label: 'Process Complete' },
    position: { x: 0, y: 800 },
    className: 'bg-background border-2 border-success'
  },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'user-start', target: 'token-purchase' },
  { id: 'e2', source: 'token-purchase', target: 'payment-choice' },
  { id: 'e3', source: 'payment-choice', target: 'crypto-payment' },
  { id: 'e4', source: 'payment-choice', target: 'card-payment' },
  { id: 'e5', source: 'crypto-payment', target: 'kyc-required' },
  { id: 'e6', source: 'card-payment', target: 'kyc-required' },
  { id: 'e7', source: 'kyc-required', target: 'kyc-submit', label: 'Yes' },
  { id: 'e8', source: 'kyc-required', target: 'payment-confirm', label: 'No' },
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
