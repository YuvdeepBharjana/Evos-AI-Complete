import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  type NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { IdentityNode } from './IdentityNode';
import { GrowthCoreNode } from './GrowthCoreNode';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { MirrorControls } from './MirrorControls';
import { QuadrantHoverPreview } from './QuadrantHoverPreview';
import { useUserStore } from '../../store/useUserStore';
import { generateReactFlowElements } from '../../lib/networkLayoutEngine';
import { CANVAS_CENTER } from '../../lib/networkLayoutEngine';

// Category positions matching networkLayoutEngine
const TYPE_POSITIONS: Record<string, { angle: number; color: string }> = {
  goal:     { angle: 270, color: '#3b82f6' },  // Top (12 o'clock)
  habit:    { angle: 330, color: '#10b981' },  // Top-right (2 o'clock)
  trait:    { angle: 30,  color: '#a855f7' },  // Bottom-right (4 o'clock)
  interest: { angle: 90,  color: '#06b6d4' },  // Bottom (6 o'clock)
  emotion:  { angle: 150, color: '#f59e0b' },  // Bottom-left (8 o'clock)
  struggle: { angle: 210, color: '#ef4444' },  // Top-left (10 o'clock)
};

const CATEGORY_RADIUS = 650;
import type { NodeType, IdentityNode as IdentityNodeType } from '../../types';
import { Brain, Target, Zap, Trophy, Heart, AlertCircle, Sparkles, ChevronDown, ChevronUp, X, TrendingUp, Calendar, Award } from 'lucide-react';

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
  const navigate = useNavigate();
  const { user, recentStrengthChanges, todayStrengthChanges } = useUserStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');
  const [showCoreSummary, setShowCoreSummary] = useState(false);
  const [quadrantPositions, setQuadrantPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Get daily action node IDs (pending actions for today)
  const dailyActionNodeIds = useMemo(() => {
    if (!user?.dailyActions) return [];
    const today = new Date().toISOString().split('T')[0];
    return user.dailyActions
      .filter(action => {
        // Check if action is for today and not completed
        const isToday = action.date === today || 
          (action.createdAt && new Date(action.createdAt).toISOString().split('T')[0] === today);
        const isPending = action.completed === null || action.completed === undefined;
        // Must have a valid nodeId (not null, undefined, empty, or 'tracking')
        const hasValidNodeId = action.nodeId && action.nodeId !== 'tracking' && action.nodeId !== 'null';
        return isToday && isPending && hasValidNodeId;
      })
      .map(action => action.nodeId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }, [user]);

  // Filter out 100% completed nodes (they've mastered it!)
  const visibleNodes = useMemo(() => {
    if (!user?.identityNodes) return [];
    return user.identityNodes.filter(node => node.strength < 100);
  }, [user]);


  // Generate React Flow elements from visible identity nodes (excluding 100%)
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!visibleNodes.length) return { nodes: [], edges: [] };
    return generateReactFlowElements(visibleNodes, recentStrengthChanges, dailyActionNodeIds, todayStrengthChanges);
  }, [visibleNodes, recentStrengthChanges, dailyActionNodeIds, todayStrengthChanges]);

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

  // Generate particle data once using lazy initializer
  type Particle = {
    width: number;
    height: number;
    left: string;
    top: string;
    colorIndex: number;
    y: number;
    x: number;
    duration: number;
    delay: number;
    glow: number;
  };

  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 20 }).map(() => ({
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      colorIndex: Math.floor(Math.random() * 5),
      y: -100 - Math.random() * 200,
      x: (Math.random() - 0.5) * 100,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 10,
      glow: Math.random() * 10 + 5,
    }))
  );

  // Update nodes when filter changes
  useMemo(() => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Calculate quadrant positions when ReactFlow instance or viewport changes
  const calculateQuadrantPositions = useCallback(() => {
    if (!reactFlowInstance) return {};

    const positions: Record<string, { x: number; y: number }> = {};
    
    BRAIN_REGIONS.forEach(region => {
      const typeConfig = TYPE_POSITIONS[region.type] || TYPE_POSITIONS.trait;
      const angleRad = (typeConfig.angle * Math.PI) / 180;
      
      // Calculate quadrant center position (same as in networkLayoutEngine)
      const quadrantPosition = {
        x: CANVAS_CENTER.x + Math.cos(angleRad) * CATEGORY_RADIUS,
        y: CANVAS_CENTER.y + Math.sin(angleRad) * CATEGORY_RADIUS
      };

      // Convert ReactFlow coordinates to screen coordinates
      const screenPosition = reactFlowInstance.project(quadrantPosition);
      positions[region.type] = screenPosition;
    });

    return positions;
  }, [reactFlowInstance]);

  // Update positions when instance is ready or nodes change
  useEffect(() => {
    if (!reactFlowInstance) return;
    
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      const positions = calculateQuadrantPositions();
      setQuadrantPositions(positions);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [reactFlowInstance, nodes, calculateQuadrantPositions]);

  const onNodeClick = useCallback((_event: any, node: any) => {
    // Show core summary for Growth Core
    if (node.id === 'growth-core') {
      setShowCoreSummary(true);
      return;
    }
    
    // Navigate to work environment for regular nodes
    navigate(`/work/${node.id}`);
  }, [navigate]);

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
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        onMove={() => {
          // Trigger position recalculation on viewport move
          if (reactFlowInstance) {
            const positions = calculateQuadrantPositions();
            setQuadrantPositions(positions);
          }
        }}
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
        {/* Epic background with multiple layers */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Base gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 100% 80% at 50% 50%, rgba(139, 92, 246, 0.12) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 70% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                linear-gradient(180deg, #0a0a0f 0%, #0d0d15 50%, #0a0a0f 100%)
              `,
            }}
          />
          
          {/* Animated glow orbs */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              left: '20%',
              top: '30%',
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 50, -30, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
              right: '10%',
              top: '20%',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, -60, 40, 0],
              y: [0, 50, -20, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              left: '50%',
              bottom: '10%',
              filter: 'blur(70px)',
            }}
            animate={{
              x: [0, 40, -50, 0],
              y: [0, -30, 40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating particles */}
          {particles.map((particle, i) => {
            const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: particle.width,
                  height: particle.height,
                  background: colors[particle.colorIndex],
                  left: particle.left,
                  top: particle.top,
                  opacity: 0.4,
                  boxShadow: `0 0 ${particle.glow}px currentColor`,
                }}
                animate={{
                  y: [0, particle.y],
                  x: [0, particle.x],
                  opacity: [0.4, 0.8, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            );
          })}

          {/* Grid lines - subtle neural network effect */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#8b5cf6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Hexagon pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%238b5cf6'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        <Background color="#1a1a2e" gap={60} size={1} />
        {/* MiniMap removed for cleaner full-screen experience */}
      </ReactFlow>

      {/* Quadrant Hover Previews - positioned relative to ReactFlow viewport */}
      {reactFlowInstance && Object.keys(quadrantPositions).length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-40">
          {BRAIN_REGIONS.map(region => {
            const typeConfig = TYPE_POSITIONS[region.type] || TYPE_POSITIONS.trait;
            const position = quadrantPositions[region.type];
            
            if (!position) return null;

            return (
              <QuadrantHoverPreview
                key={region.type}
                type={region.type as any}
                position={position}
                angle={typeConfig.angle}
              />
            );
          })}
        </div>
      )}

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


      {/* Core Summary Modal */}
      <AnimatePresence>
        {showCoreSummary && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowCoreSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(30,20,50,0.98) 0%, rgba(15,10,30,0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.2), 0 25px 50px rgba(0,0,0,0.5)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header with sphere visualization */}
              <div className="relative h-32 overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at 50% 120%, rgba(139, 92, 246, 0.4) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    className="w-20 h-20 rounded-full"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 40%),
                        radial-gradient(circle at 70% 70%, rgba(0,0,0,0.4) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, #8b5cf6 0%, #6366f1 40%, #4f46e5 70%, #3730a3 100%)
                      `,
                      boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.5), inset 4px 4px 10px rgba(255,255,255,0.15), 0 0 40px rgba(139, 92, 246, 0.5)',
                    }}
                    animate={{ 
                      boxShadow: [
                        'inset -4px -4px 10px rgba(0,0,0,0.5), inset 4px 4px 10px rgba(255,255,255,0.15), 0 0 40px rgba(139, 92, 246, 0.5)',
                        'inset -4px -4px 10px rgba(0,0,0,0.5), inset 4px 4px 10px rgba(255,255,255,0.15), 0 0 60px rgba(139, 92, 246, 0.7)',
                        'inset -4px -4px 10px rgba(0,0,0,0.5), inset 4px 4px 10px rgba(255,255,255,0.15), 0 0 40px rgba(139, 92, 246, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <button
                  onClick={() => setShowCoreSummary(false)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 pt-2">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  Identity Evolution
                </h2>
                <p className="text-center text-gray-400 text-sm mb-6">Your journey to becoming who you want to be</p>

                {/* Progress to ideal self */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress to Ideal Self</span>
                    <span className="text-lg font-bold text-purple-400">{stats.avgStrength}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.avgStrength}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {stats.avgStrength < 30 && "You're just getting started. Keep building momentum!"}
                    {stats.avgStrength >= 30 && stats.avgStrength < 50 && "Making progress! Your identity is taking shape."}
                    {stats.avgStrength >= 50 && stats.avgStrength < 70 && "Halfway there! Your new identity is becoming real."}
                    {stats.avgStrength >= 70 && stats.avgStrength < 90 && "Strong progress! You're becoming who you want to be."}
                    {stats.avgStrength >= 90 && "You've nearly transformed into your ideal self!"}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <div className="text-lg font-bold text-white">{stats.visible}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Active Nodes</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <Award className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="text-lg font-bold text-white">{stats.completed}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Mastered</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                    <div className="text-lg font-bold text-white">{user?.dailyActions?.filter(a => a.completed).length || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Today Done</div>
                  </div>
                </div>

                {/* Today's strength changes */}
                {recentStrengthChanges && Object.keys(recentStrengthChanges).length > 0 && (() => {
                  const netChange = Object.values(recentStrengthChanges).reduce((sum, val) => sum + val, 0);
                  return (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Today's Progress
                        </h3>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${netChange >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          <TrendingUp className={`w-4 h-4 ${netChange >= 0 ? 'text-emerald-400' : 'text-red-400 rotate-180'}`} />
                          <span className={`text-sm font-bold ${netChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {netChange >= 0 ? '+' : ''}{netChange}% Net
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {Object.entries(recentStrengthChanges).slice(0, 5).map(([nodeId, change]) => {
                          const node = user?.identityNodes.find(n => n.id === nodeId);
                          return (
                            <div key={nodeId} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                              <span className="text-xs text-gray-300 truncate max-w-[180px]">{node?.label || nodeId}</span>
                              <span className={`text-xs font-bold ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {change > 0 ? '+' : ''}{change}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Motivational message */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                  <p className="text-sm text-center text-white/80 italic">
                    "{stats.avgStrength >= 50 
                      ? "You're not just changing habits - you're rewriting your identity." 
                      : "Every action you take is a vote for the person you want to become."}"
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
