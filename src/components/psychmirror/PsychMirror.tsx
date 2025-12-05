import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { IdentityNode } from './IdentityNode';
import { GrowthCoreNode } from './GrowthCoreNode';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { MirrorControls } from './MirrorControls';
import { AddNodeModal } from './AddNodeModal';
import { useUserStore } from '../../store/useUserStore';
import { generateReactFlowElements } from '../../lib/networkLayoutEngine';
import type { NodeType, IdentityNode as IdentityNodeType } from '../../types';
import { Brain, Target, Zap, Trophy, Heart, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const nodeTypes: NodeTypes = {
  identityNode: IdentityNode,
  growthCore: GrowthCoreNode,
};

// Brain region info for the legend
const BRAIN_REGIONS = [
  { type: 'goal', label: 'Goals', region: 'Prefrontal Cortex', icon: Target, color: '#3b82f6', description: 'Planning & vision' },
  { type: 'habit', label: 'Habits', region: 'Motor Cortex', icon: Zap, color: '#10b981', description: 'Actions & routines' },
  { type: 'trait', label: 'Traits', region: 'Temporal Lobe', icon: Trophy, color: '#a855f7', description: 'Personality & character' },
  { type: 'emotion', label: 'Emotions', region: 'Limbic System', icon: Heart, color: '#f59e0b', description: 'Feelings & mood' },
  { type: 'struggle', label: 'Struggles', region: 'Amygdala', icon: AlertCircle, color: '#ef4444', description: 'Challenges & fears' },
  { type: 'interest', label: 'Interests', region: 'Reward Center', icon: Sparkles, color: '#06b6d4', description: 'Passions & curiosities' },
];

export const PsychMirror = () => {
  const { user, recentStrengthChanges, addNodes } = useUserStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  const handleAddNode = (node: IdentityNodeType) => {
    addNodes([node]);
  };

  // Get daily action node IDs
  const dailyActionNodeIds = useMemo(() => {
    if (!user?.dailyActions) return [];
    return user.dailyActions
      .filter(action => action.completed === null && action.nodeId !== 'tracking')
      .map(action => action.nodeId);
  }, [user?.dailyActions]);

  // Filter out 100% completed nodes (they've mastered it!)
  const visibleNodes = useMemo(() => {
    if (!user?.identityNodes) return [];
    return user.identityNodes.filter(node => node.strength < 100);
  }, [user?.identityNodes]);


  // Generate React Flow elements from visible identity nodes (excluding 100%)
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!visibleNodes.length) return { nodes: [], edges: [] };
    return generateReactFlowElements(visibleNodes, recentStrengthChanges, dailyActionNodeIds);
  }, [visibleNodes, recentStrengthChanges, dailyActionNodeIds]);

  // Filter nodes based on selected type (always include Growth Core)
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return initialNodes;
    return initialNodes.filter(node => 
      node.id === 'growth-core' || node.data.type === filterType
    );
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
    // Don't open details panel for Growth Core
    if (node.id === 'growth-core') return;
    setSelectedNodeId(node.id);
    
    // Zoom to node and center it on screen
    if (reactFlowInstance && node.position) {
      const nodeWidth = 120; // approximate node width
      const nodeHeight = 120; // approximate node height
      const x = node.position.x + nodeWidth / 2;
      const y = node.position.y + nodeHeight / 2;
      
      // Gentle zoom and center on the node with smooth animation
      reactFlowInstance.setCenter(x, y, { 
        zoom: 1.1, 
        duration: 600 
      });
    }
  }, [reactFlowInstance]);

  const handleZoomIn = () => reactFlowInstance?.zoomIn();
  const handleZoomOut = () => reactFlowInstance?.zoomOut();
  const handleFitView = () => reactFlowInstance?.fitView({ 
    padding: 0.15, 
    maxZoom: 1.2,
    duration: 800 
  });

  const selectedNode = user?.identityNodes.find(n => n.id === selectedNodeId) || null;

  // Calculate stats
  const stats = useMemo(() => {
    if (!user?.identityNodes) return null;
    const nodes = user.identityNodes;
    const avgStrength = Math.round(nodes.reduce((acc, n) => acc + n.strength, 0) / nodes.length);
    const completed = nodes.filter(n => n.strength >= 100).length;
    const active = nodes.filter(n => n.status === 'active' && n.strength < 100).length;
    const developing = nodes.filter(n => n.status === 'developing' && n.strength < 100).length;
    return { total: nodes.length, visible: visibleNodes.length, avgStrength, completed, active, developing };
  }, [user?.identityNodes, visibleNodes]);

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
        fitViewOptions={{ 
          padding: 0.15, 
          maxZoom: 1.2,
          duration: 800,
        }}
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 150, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-right"
        className="!bg-transparent"
        style={{ background: 'transparent' }}
      >
        {/* Clean background */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
              linear-gradient(180deg, #0a0a0f 0%, #0d0d15 50%, #0a0a0f 100%)
            `,
          }}
        />
        
        <Background color="#1a1a2e" gap={50} size={1} />
        {/* MiniMap - Hidden on mobile */}
        <MiniMap
          nodeColor={(node) => {
            if (node.id === 'growth-core') return '#8b5cf6';
            const colors = {
              habit: '#10b981',
              goal: '#3b82f6',
              trait: '#a855f7',
              emotion: '#f59e0b',
              struggle: '#ef4444',
              interest: '#06b6d4'
            };
            return colors[node.data?.type as keyof typeof colors] || '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.9)"
          className="hidden sm:block"
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(10,10,20,0.95) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        />
      </ReactFlow>


      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={() => {
          setSelectedNodeId(null);
          // Reset view to fit all nodes when closing
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ 
              padding: 0.15, 
              maxZoom: 1.2,
              duration: 600 
            });
          }
        }} 
      />

      {/* Brain Map Legend - Hidden on mobile, shown on larger screens */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:block absolute bottom-4 left-4 max-w-[320px]"
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '18px',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '16px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <Brain className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Neural Map</span>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Identity Regions</div>
            </div>
          </div>
          <motion.button
            onClick={() => setLegendCollapsed(!legendCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={legendCollapsed ? "Expand legend" : "Collapse legend"}
          >
            {legendCollapsed ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {!legendCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="space-y-2">
                {BRAIN_REGIONS.map(region => {
            const Icon = region.icon;
            const count = user.identityNodes.filter(n => n.type === region.type).length;
            const isActive = filterType === region.type;
            return (
              <motion.button
                key={region.type}
                onClick={() => setFilterType(isActive ? 'all' : region.type as NodeType)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all"
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${region.color}15 0%, ${region.color}08 100%)`
                    : 'transparent',
                  border: isActive 
                    ? `1px solid ${region.color}40` 
                    : '1px solid transparent',
                  boxShadow: isActive ? `0 0 20px ${region.color}15` : 'none',
                }}
                whileHover={{ 
                  x: 4,
                  background: `linear-gradient(135deg, ${region.color}10 0%, ${region.color}05 100%)`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${region.color}25 0%, ${region.color}10 100%)`,
                    border: `1px solid ${region.color}30`,
                  }}
                >
                  <Icon size={16} style={{ color: region.color }} />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: `${region.color}20` }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/90">{region.label}</span>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ 
                        background: count > 0 ? `${region.color}20` : 'rgba(255,255,255,0.05)',
                        color: count > 0 ? region.color : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500">{region.region}</div>
                </div>
              </motion.button>
            );
          })}
              </div>

              {/* Stats summary */}
              {stats && (
                <div 
                  className="mt-4 pt-3 grid grid-cols-3 gap-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="text-center">
                    <div 
                      className="text-lg font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                    >
                      {stats.visible}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Active</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="text-lg font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                    >
                      {stats.avgStrength}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Avg</div>
                  </div>
                  <div className="text-center">
                    <div 
                      className="text-lg font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                    >
                      {stats.completed}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Complete</div>
                  </div>
                </div>
              )}

              {/* Completed nodes note */}
              {stats && stats.completed > 0 && (
                <div className="mt-3 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] text-green-400">
                    ✓ {stats.completed} node{stats.completed > 1 ? 's' : ''} at 100% - fully integrated!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
