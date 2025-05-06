
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSystemFlow } from './hooks/useSystemFlow';

const SystemFlowChart: React.FC = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect 
  } = useSystemFlow();

  return (
    <ReactFlowProvider>
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
    </ReactFlowProvider>
  );
};

export default SystemFlowChart;
