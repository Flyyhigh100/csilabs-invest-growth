
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSystemFlow } from './hooks/useSystemFlow';

const SystemFlowChart = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect 
  } = useSystemFlow();

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
