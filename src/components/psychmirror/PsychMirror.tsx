import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3-force';
import { useUserStore } from '../../store/useUserStore';
import { Play, X, TrendingUp, AlertTriangle, Target, Zap, Trophy, Heart, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type NodeCategory = "Goal" | "Habit" | "Trait" | "Emotion" | "Struggle";
type NodeState = "critical" | "developing" | "dominant";

type PsychNode = {
  id: string;
  label: string;
  value: number;
  category: NodeCategory;
  state?: NodeState;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

type PsychEdge = {
  id?: string;
  source: string | PsychNode;
  target: string | PsychNode;
  weight: number;
};

// ============================================================================
// HELPERS
// ============================================================================

function getNodeState(value: number): NodeState {
  if (value < 40) return "critical";
  if (value < 70) return "developing";
  return "dominant";
}

function getCategoryColor(category: NodeCategory): string {
  switch (category) {
    case "Goal":     return "#3b82f6";
    case "Habit":    return "#10b981";
    case "Trait":    return "#a855f7";
    case "Emotion":  return "#f59e0b";
    case "Struggle": return "#ef4444";
  }
}

function getCategoryIcon(category: NodeCategory) {
  switch (category) {
    case "Goal":     return Target;
    case "Habit":    return Zap;
    case "Trait":    return Trophy;
    case "Emotion":  return Heart;
    case "Struggle": return AlertCircle;
  }
}

function mapNodeType(type: string): NodeCategory {
  const mapping: Record<string, NodeCategory> = {
    'goal': 'Goal',
    'habit': 'Habit',
    'trait': 'Trait',
    'emotion': 'Emotion',
    'struggle': 'Struggle',
    'interest': 'Goal'
  };
  return mapping[type.toLowerCase()] || 'Trait';
}

function getCategoryRegion(category: NodeCategory, scale: number): { x: number; y: number } {
  const offset = scale * 0.3;
  switch (category) {
    case "Goal":     return { x: 0, y: -offset };
    case "Trait":    return { x: -offset * 0.8, y: -offset * 0.3 };
    case "Habit":    return { x: offset * 0.8, y: -offset * 0.3 };
    case "Emotion":  return { x: -offset * 0.6, y: offset * 0.6 };
    case "Struggle": return { x: offset * 0.6, y: offset * 0.6 };
  }
}

function computeSummaryStats(nodes: PsychNode[]) {
  if (nodes.length === 0) return { avgValue: 0, criticalCount: 0, dominantCount: 0, worst: null, best: null };
  
  const avgValue = Math.round(nodes.reduce((sum, n) => sum + n.value, 0) / nodes.length);
  const criticalCount = nodes.filter(n => (n.state || getNodeState(n.value)) === "critical").length;
  const dominantCount = nodes.filter(n => (n.state || getNodeState(n.value)) === "dominant").length;
  
  const worst = nodes.reduce((min, n) => n.value < min.value ? n : min, nodes[0]);
  const nonStruggles = nodes.filter(n => n.category !== "Struggle");
  const best = nonStruggles.length > 0 
    ? nonStruggles.reduce((max, n) => n.value > max.value ? n : max, nonStruggles[0])
    : null;
  
  return { avgValue, criticalCount, dominantCount, worst, best };
}

function generateEdges(nodes: PsychNode[]): PsychEdge[] {
  const edges: PsychEdge[] = [];
  const edgeSet = new Set<string>();
  
  nodes.forEach(node => {
    const sameCategory = nodes.filter(n => n.id !== node.id && n.category === node.category);
    const others = nodes.filter(n => n.id !== node.id && n.category !== node.category);
    
    // Connect to 1-2 nodes in same category
    sameCategory.slice(0, 2).forEach(target => {
      const key = [node.id, target.id].sort().join('|');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ source: node.id, target: target.id, weight: 0.7 });
      }
    });
    
    // Connect to 1 node in different category
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      const key = [node.id, target.id].sort().join('|');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ source: node.id, target: target.id, weight: 0.3 });
      }
    }
  });
  
  return edges;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PsychMirror: React.FC = () => {
  const navigate = useNavigate();
  const { user, startWorkSession, lastUpdatedNodeId, clearLastUpdatedNode, recentStrengthChanges, clearRecentStrengthChanges, todayStrengthChanges, todayStrengthDate } = useUserStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [selectedNode, setSelectedNode] = useState<PsychNode | null>(null);
  const [hoverNode, setHoverNode] = useState<PsychNode | null>(null);
  const [filterCategory, setFilterCategory] = useState<NodeCategory | 'all'>('all');
  const [showTodaysFocus, setShowTodaysFocus] = useState(false);
  const fgRef = useRef<any>(null);

  // Get today's daily action node IDs for highlighting
  const todayActionNodeIds = useMemo(() => {
    if (!user?.dailyActions) return new Set<string>();
    const today = new Date();
    return new Set(
      user.dailyActions
        .filter(a => {
          if (!a.createdAt || a.nodeId === 'tracking') return false;
          const actionDate = new Date(a.createdAt);
          return actionDate.toDateString() === today.toDateString();
        })
        .map(a => a.nodeId)
    );
  }, [user?.dailyActions]);

  // Auto-clear lastUpdatedNodeId after 3 seconds (increased for visibility)
  useEffect(() => {
    if (lastUpdatedNodeId) {
      const timer = setTimeout(() => {
        clearLastUpdatedNode();
        clearRecentStrengthChanges?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdatedNodeId, clearLastUpdatedNode, clearRecentStrengthChanges]);

  // Convert user's identity nodes to PsychNodes
  const graphData = useMemo(() => {
    if (!user?.identityNodes || user.identityNodes.length === 0) {
      return { nodes: [], links: [] };
    }

    const scale = Math.min(dimensions.width, dimensions.height);
    
    let nodes: PsychNode[] = user.identityNodes.map(node => {
      const category = mapNodeType(node.type);
      const region = getCategoryRegion(category, scale);
      const jitter = () => (Math.random() - 0.5) * 30;
      
      return {
        id: node.id,
        label: node.label,
        value: node.strength,
        category,
        state: getNodeState(node.strength),
        x: region.x + jitter(),
        y: region.y + jitter()
      };
    });
    
    // Filter by category if selected
    if (filterCategory !== 'all') {
      nodes = nodes.filter(n => n.category === filterCategory);
    }
    
    // Filter by today's focus if selected
    if (showTodaysFocus) {
      nodes = nodes.filter(n => todayActionNodeIds.has(n.id));
    }
    
    const edges = generateEdges(nodes);
    return { nodes, links: edges };
  }, [user?.identityNodes, dimensions, filterCategory, showTodaysFocus, todayActionNodeIds]);

  const stats = useMemo(() => computeSummaryStats(graphData.nodes), [graphData.nodes]);

  // Handle resize - use full container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Use more of the available space
        setDimensions({ 
          width: Math.max(rect.width - 20, 400), 
          height: Math.max(rect.height - 20, 400) 
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Apply forces
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const fg = fgRef.current;
      const scale = Math.min(dimensions.width, dimensions.height) * 0.35;
      
      fg.d3Force('x', d3.forceX((node: PsychNode) => {
        return getCategoryRegion(node.category, scale).x;
      }).strength(0.15));
      
      fg.d3Force('y', d3.forceY((node: PsychNode) => {
        return getCategoryRegion(node.category, scale).y;
      }).strength(0.15));
      
      fg.d3Force('charge')?.strength(-120);
      fg.d3Force('link')?.distance(60);
      
      fg.d3Force('collision', d3.forceCollide(30));
      
      // Center the graph
      setTimeout(() => {
        fg.zoomToFit(400, 50);
      }, 500);
    }
  }, [dimensions, graphData.nodes.length, filterCategory]);

  // Node rendering
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const psychNode = node as PsychNode;
    const baseRadius = 22 / globalScale;
    const color = getCategoryColor(psychNode.category);
    const state = psychNode.state || getNodeState(psychNode.value);
    const isSelected = selectedNode?.id === psychNode.id;
    const isHovered = hoverNode?.id === psychNode.id;
    const isLastUpdated = lastUpdatedNodeId === psychNode.id;
    const hasDailyAction = todayActionNodeIds.has(psychNode.id);
    const strengthChange = recentStrengthChanges[psychNode.id];
    
    // Get today's accumulated strength change (persistent for the day)
    const isToday = todayStrengthDate === new Date().toDateString();
    const todayChange = isToday ? todayStrengthChanges[psychNode.id] : undefined;
    
    ctx.save();
    
    // Daily action indicator (subtle outer ring)
    if (hasDailyAction && !isLastUpdated) {
      ctx.strokeStyle = '#fbbf24'; // Amber/yellow
      ctx.lineWidth = 2 / globalScale;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([4 / globalScale, 4 / globalScale]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + 8 / globalScale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Last updated highlight (brief pulse effect)
    if (isLastUpdated) {
      // Large glow
      ctx.shadowColor = strengthChange && strengthChange > 0 ? '#22c55e' : '#ef4444';
      ctx.shadowBlur = 60 / globalScale;
      ctx.fillStyle = strengthChange && strengthChange > 0 ? '#22c55e' : '#ef4444';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + 15 / globalScale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Pulsing outer ring
      ctx.strokeStyle = strengthChange && strengthChange > 0 ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 4 / globalScale;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + 8 / globalScale, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Show strength change value
      if (strengthChange) {
        ctx.globalAlpha = 1;
        ctx.font = `bold ${14 / globalScale}px Arial`;
        ctx.fillStyle = strengthChange > 0 ? '#22c55e' : '#ef4444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const changeText = strengthChange > 0 ? `+${strengthChange}%` : `${strengthChange}%`;
        ctx.fillText(changeText, node.x, node.y - baseRadius - 12 / globalScale);
      }
    }
    
    // Selection/hover highlight
    if (isSelected || isHovered) {
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 40 : 25;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + 8 / globalScale, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Outer ring
    ctx.strokeStyle = color;
    ctx.lineWidth = (state === "dominant" ? 3 : 2) / globalScale;
    ctx.globalAlpha = state === "critical" ? 0.6 : 1;
    ctx.beginPath();
    ctx.arc(node.x, node.y, baseRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner fill based on value
    const fillRadius = baseRadius * (psychNode.value / 100) * 0.85;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(node.x, node.y, fillRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Critical indicator
    if (state === "critical") {
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 2 / globalScale;
      ctx.globalAlpha = 0.8;
      ctx.setLineDash([4 / globalScale, 4 / globalScale]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + 4 / globalScale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Value text
    ctx.fillStyle = "white";
    ctx.globalAlpha = 1;
    ctx.font = `bold ${11 / globalScale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(psychNode.value.toString(), node.x, node.y);
    
    // Today's change indicator (persistent - shown all day)
    if (todayChange) {
      // Draw background pill for better visibility
      ctx.globalAlpha = 0.9;
      const changeText = todayChange > 0 ? `+${todayChange}` : `${todayChange}`;
      const textWidth = ctx.measureText(changeText).width || 20;
      const pillWidth = (textWidth + 8) / globalScale;
      const pillHeight = 14 / globalScale;
      const pillY = node.y - baseRadius - 14 / globalScale;
      
      // Background pill
      ctx.fillStyle = todayChange > 0 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.roundRect(node.x - pillWidth / 2, pillY - pillHeight / 2, pillWidth, pillHeight, 4 / globalScale);
      ctx.fill();
      
      // Text
      ctx.font = `bold ${10 / globalScale}px system-ui`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(changeText, node.x, pillY);
    }
    
    // Label below - clean up asterisks and truncate
    ctx.font = `${9 / globalScale}px system-ui`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    const cleanLabel = psychNode.label.replace(/\*/g, '').trim();
    const label = cleanLabel.length > 12 ? cleanLabel.slice(0, 12) + '…' : cleanLabel;
    ctx.fillText(label, node.x, node.y + baseRadius + 10 / globalScale);
    
    ctx.restore();
  }, [selectedNode, hoverNode, lastUpdatedNodeId, todayActionNodeIds, recentStrengthChanges, todayStrengthChanges, todayStrengthDate]);

  // Link rendering
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const source = link.source as PsychNode;
    const target = link.target as PsychNode;
    
    ctx.save();
    ctx.strokeStyle = getCategoryColor(source.category);
    ctx.globalAlpha = 0.15 + link.weight * 0.15;
    ctx.lineWidth = 1 / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(source.x!, source.y!);
    ctx.lineTo(target.x!, target.y!);
    ctx.stroke();
    ctx.restore();
  }, []);

  // Handle work session start
  const handleStartWork = () => {
    if (selectedNode) {
      // Find the original node to get the ID
      const originalNode = user?.identityNodes.find(n => n.id === selectedNode.id);
      if (originalNode) {
        startWorkSession(originalNode.id, originalNode.label);
        navigate('/work-session');
      }
    }
  };

  // Empty state
  if (!user?.identityNodes || user.identityNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Identity Data Yet</h2>
          <p className="text-gray-400 mb-6">
            Complete onboarding to build your psychological mirror and see your identity visualized.
          </p>
          <button 
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full w-full flex flex-col"
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage: `
          radial-gradient(ellipse 100% 80% at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 80% 60% at 20% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
          radial-gradient(ellipse 60% 60% at 80% 100%, rgba(168, 85, 247, 0.05) 0%, transparent 40%)
        `
      }}
    >
      {/* Header with Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Identity Map</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">
              <span className="text-white font-medium">{stats.avgValue}%</span> avg
            </span>
            {stats.criticalCount > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertTriangle size={14} />
                {stats.criticalCount} critical
              </span>
            )}
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={14} />
              {stats.dominantCount} strong
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <button
          onClick={() => {
            setFilterCategory('all');
            setShowTodaysFocus(false);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterCategory === 'all' && !showTodaysFocus
              ? 'bg-white/10 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All
        </button>
        {(["Goal", "Habit", "Trait", "Emotion", "Struggle"] as NodeCategory[]).map(cat => {
          const Icon = getCategoryIcon(cat);
          const count = user?.identityNodes.filter(n => mapNodeType(n.type) === cat).length || 0;
          const isActive = filterCategory === cat && !showTodaysFocus;
          return (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(isActive ? 'all' : cat);
                setShowTodaysFocus(false); // Reset today's focus when selecting category
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? `${getCategoryColor(cat)}30` : 'transparent',
                borderColor: isActive ? getCategoryColor(cat) : 'transparent',
                borderWidth: '1px'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <Icon size={12} style={{ color: isActive ? getCategoryColor(cat) : undefined }} />
              <span>{cat}s</span>
              <span className="text-gray-500">({count})</span>
            </button>
          );
        })}
        {/* Daily Focus Indicator - Clickable to filter */}
        {todayActionNodeIds.size > 0 && (
          <button
            onClick={() => {
              setShowTodaysFocus(!showTodaysFocus);
              if (!showTodaysFocus) setFilterCategory('all'); // Reset category filter when showing today's focus
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-l border-white/10 ml-2 rounded-lg transition-all ${
              showTodaysFocus 
                ? 'bg-amber-500/20 ring-1 ring-amber-400/50' 
                : 'hover:bg-amber-500/10'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full border-2 border-dashed border-amber-400 ${showTodaysFocus ? '' : 'animate-pulse'}`} />
            <span className="text-amber-400 text-xs font-medium">
              {showTodaysFocus ? '✓ ' : ''}Today's Focus ({todayActionNodeIds.size})
            </span>
          </button>
        )}
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center relative overflow-hidden">
        <ForceGraph2D
          key={`${filterCategory}-${showTodaysFocus}`}
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={nodeCanvasObject}
          linkCanvasObject={linkCanvasObject}
          nodePointerAreaPaint={(node, color, ctx, globalScale) => {
            const size = 30 / globalScale;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeHover={(node) => {
            setHoverNode(node as PsychNode | null);
            document.body.style.cursor = node ? 'pointer' : 'default';
          }}
          onNodeClick={(node) => {
            console.log('Node clicked:', node);
            setSelectedNode(node as PsychNode);
          }}
          onBackgroundClick={() => setSelectedNode(null)}
          enableNodeDrag={false}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          backgroundColor="transparent"
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />

        {/* Hover Tooltip */}
        {hoverNode && !selectedNode && (
          <div 
            className="absolute top-4 right-4 p-3 rounded-xl text-sm"
            style={{
              background: 'rgba(15, 15, 20, 0.95)',
              border: `1px solid ${getCategoryColor(hoverNode.category)}40`,
              backdropFilter: 'blur(10px)',
              maxWidth: '200px'
            }}
          >
            <div className="font-medium text-white mb-1">{hoverNode.label.replace(/\*/g, '').trim()}</div>
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: getCategoryColor(hoverNode.category) }}>{hoverNode.category}</span>
              <span className="text-gray-400">•</span>
              <span className="text-white">{hoverNode.value}%</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                hoverNode.state === 'critical' ? 'bg-red-500/20 text-red-400' :
                hoverNode.state === 'dominant' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {hoverNode.state}
              </span>
          </div>
          </div>
        )}
        </div>
        
      {/* Selected Node Panel */}
      {selectedNode && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-2xl w-full max-w-md mx-4"
                style={{
            background: 'rgba(15, 15, 20, 0.98)',
            border: `1px solid ${getCategoryColor(selectedNode.category)}50`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 40px ${getCategoryColor(selectedNode.category)}20`
          }}
        >
          <button 
            onClick={() => setSelectedNode(null)}
            className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>

          <div className="flex items-start gap-4">
            {/* Node indicator */}
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ 
                background: `${getCategoryColor(selectedNode.category)}20`,
                border: `2px solid ${getCategoryColor(selectedNode.category)}`
              }}
            >
              <span className="text-2xl font-bold text-white">{selectedNode.value}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{selectedNode.label.replace(/\*/g, '').trim()}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    background: `${getCategoryColor(selectedNode.category)}20`,
                    color: getCategoryColor(selectedNode.category)
                  }}
                >
                  {selectedNode.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedNode.state === 'critical' ? 'bg-red-500/20 text-red-400' :
                  selectedNode.state === 'dominant' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedNode.state === 'critical' ? '⚠️ Needs attention' :
                   selectedNode.state === 'dominant' ? '✨ Strong' : '📈 Developing'}
                    </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${selectedNode.value}%`,
                    background: getCategoryColor(selectedNode.category)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartWork}
            className="w-full mt-4 py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${getCategoryColor(selectedNode.category)}, ${getCategoryColor(selectedNode.category)}cc)`,
              boxShadow: `0 4px 20px ${getCategoryColor(selectedNode.category)}40`
            }}
          >
            <Play size={18} />
            Work on This
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            Start a timed session to improve this node
          </p>
        </div>
      )}
    </div>
  );
};

export default PsychMirror;
