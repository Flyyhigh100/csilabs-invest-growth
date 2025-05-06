
import { useCallback } from 'react';
import { Edge, useNodesState, useEdgesState, addEdge, Connection, Edge as EdgeType } from '@xyflow/react';
import { initialNodes } from '../data/initialNodes';
import { initialEdges } from '../data/initialEdges';

export const useSystemFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect
  };
};
