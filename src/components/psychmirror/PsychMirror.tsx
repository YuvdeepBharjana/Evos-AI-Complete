import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { IdentityNode } from './IdentityNode';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { MirrorControls } from './MirrorControls';
import { useUserStore } from '../../store/useUserStore';
import { generateReactFlowElements } from '../../lib/networkLayoutEngine';
import type { NodeType } from '../../types';

const nodeTypes: NodeTypes = {
  identityNode: IdentityNode
};

export const PsychMirror = () => {
  const { user } = useUserStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');

  // Generate React Flow elements from user's identity nodes
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!user?.identityNodes) return { nodes: [], edges: [] };
    return generateReactFlowElements(user.identityNodes);
  }, [user?.identityNodes]);

  // Filter nodes based on selected type
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return initialNodes;
    return initialNodes.filter(node => node.data.type === filterType);
  }, [initialNodes, filterType]);

  const filteredEdges = useMemo(() => {
    if (filterType === 'all') return initialEdges;
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return initialEdges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [initialEdges, filteredNodes, filterType]);

  const [nodes, setNodes, onNodesChange] = useNodesState(filteredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredEdges);

  // Update nodes when filter changes
  useMemo(() => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onNodeClick = useCallback((_event: any, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleZoomIn = () => reactFlowInstance?.zoomIn();
  const handleZoomOut = () => reactFlowInstance?.zoomOut();
  const handleFitView = () => reactFlowInstance?.fitView({ padding: 0.2 });

  const selectedNode = user?.identityNodes.find(n => n.id === selectedNodeId) || null;

  if (!user?.identityNodes || user.identityNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-2">No Identity Data Yet</h2>
          <p className="text-gray-400">
            Complete onboarding or start chatting to build your psychological mirror
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MirrorControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        selectedFilter={filterType}
        onFilterChange={setFilterType}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-right"
        className="bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950"
      >
        <Background color="#374151" gap={20} size={1} />
        <MiniMap
          nodeColor={(node) => {
            const colors = {
              habit: '#10b981',
              goal: '#3b82f6',
              trait: '#a855f7',
              emotion: '#f59e0b',
              struggle: '#ef4444'
            };
            return colors[node.data.type as keyof typeof colors] || '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-gray-900 !border-gray-700"
        />
      </ReactFlow>

      <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />

      {/* Legend */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-4 left-4 glass rounded-xl p-4 text-xs"
      >
        <div className="font-semibold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600" />
            <span>Habits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
            <span>Goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
            <span>Traits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
            <span>Emotions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
            <span>Struggles</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400">
          <div>💚 Mastered • ⚡ Active</div>
          <div>🌱 Developing • 💤 Neglected</div>
        </div>
      </motion.div>
    </div>
  );
};

