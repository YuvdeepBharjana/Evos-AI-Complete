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
import { AddNodeModal } from './AddNodeModal';
import { useUserStore } from '../../store/useUserStore';
import { generateReactFlowElements } from '../../lib/networkLayoutEngine';
import type { NodeType, IdentityNode as IdentityNodeType } from '../../types';
import { Brain, Target, Zap, Trophy, Heart, AlertCircle } from 'lucide-react';

const nodeTypes: NodeTypes = {
  identityNode: IdentityNode
};

// Brain region info for the legend
const BRAIN_REGIONS = [
  { type: 'goal', label: 'Goals', region: 'Prefrontal Cortex', icon: Target, color: '#3b82f6', description: 'Planning & vision' },
  { type: 'habit', label: 'Habits', region: 'Motor Cortex', icon: Zap, color: '#10b981', description: 'Actions & routines' },
  { type: 'trait', label: 'Traits', region: 'Temporal Lobe', icon: Trophy, color: '#a855f7', description: 'Personality & character' },
  { type: 'emotion', label: 'Emotions', region: 'Limbic System', icon: Heart, color: '#f59e0b', description: 'Feelings & mood' },
  { type: 'struggle', label: 'Struggles', region: 'Amygdala', icon: AlertCircle, color: '#ef4444', description: 'Challenges & fears' },
];

export const PsychMirror = () => {
  const { user, recentStrengthChanges, addNodes } = useUserStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddNode = (node: IdentityNodeType) => {
    addNodes([node]);
  };

  // Generate React Flow elements from user's identity nodes
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!user?.identityNodes) return { nodes: [], edges: [] };
    return generateReactFlowElements(user.identityNodes, recentStrengthChanges);
  }, [user?.identityNodes, recentStrengthChanges]);

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

  // Calculate stats
  const stats = useMemo(() => {
    if (!user?.identityNodes) return null;
    const nodes = user.identityNodes;
    const avgStrength = Math.round(nodes.reduce((acc, n) => acc + n.strength, 0) / nodes.length);
    const mastered = nodes.filter(n => n.status === 'mastered').length;
    const active = nodes.filter(n => n.status === 'active').length;
    const developing = nodes.filter(n => n.status === 'developing').length;
    return { total: nodes.length, avgStrength, mastered, active, developing };
  }, [user?.identityNodes]);

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
        onAddNode={() => setShowAddModal(true)}
      />

      <AddNodeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddNode}
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
        minZoom={0.3}
        maxZoom={2}
        attributionPosition="bottom-right"
        className="bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950"
      >
        <Background color="#1f2937" gap={40} size={1} />
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
          maskColor="rgba(0, 0, 0, 0.85)"
          className="!bg-gray-900/90 !border-gray-700 !rounded-lg"
        />
      </ReactFlow>


      <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />

      {/* Brain Map Legend */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute bottom-4 left-4 glass rounded-2xl p-5 max-w-xs"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-sm">Neural Map Legend</span>
        </div>
        
        <div className="space-y-3">
          {BRAIN_REGIONS.map(region => {
            const Icon = region.icon;
            const count = user.identityNodes.filter(n => n.type === region.type).length;
            return (
              <motion.button
                key={region.type}
                onClick={() => setFilterType(filterType === region.type ? 'all' : region.type as NodeType)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  filterType === region.type 
                    ? 'bg-white/10 ring-1' 
                    : 'hover:bg-white/5'
                }`}
                style={filterType === region.type ? { 
                  boxShadow: `inset 0 0 0 1px ${region.color}` 
                } : {}}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <Icon size={16} style={{ color: region.color }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{region.label}</span>
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">{region.region}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-white">{stats.total}</div>
                <div className="text-[10px] text-gray-500">Nodes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{stats.avgStrength}%</div>
                <div className="text-[10px] text-gray-500">Avg Strength</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">{stats.mastered}</div>
                <div className="text-[10px] text-gray-500">Mastered</div>
              </div>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-green-400">●</span> Mastered
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-400">◉</span> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">○</span> Developing
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">◌</span> Neglected
          </span>
        </div>
      </motion.div>
    </div>
  );
};
