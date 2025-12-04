import type { IdentityNode } from '../types';
import type { Node, Edge } from 'reactflow';

// Larger canvas with more space between clusters
const CANVAS_CENTER = { x: 1200, y: 800 };
const OUTER_RADIUS = 550; // Increased for more separation

// Hexagon positions for 6 node types - evenly distributed around center (60° apart)
const TYPE_POSITIONS: Record<string, { angle: number; color: string }> = {
  goal: { angle: -90, color: '#3b82f6' },      // Top (12 o'clock)
  trait: { angle: -30, color: '#a855f7' },     // Top right (2 o'clock)
  interest: { angle: 30, color: '#06b6d4' },   // Right (4 o'clock)
  struggle: { angle: 90, color: '#ef4444' },   // Bottom (6 o'clock)
  emotion: { angle: 150, color: '#f59e0b' },   // Bottom left (8 o'clock)
  habit: { angle: 210, color: '#10b981' },     // Top left (10 o'clock)
};

export const generateReactFlowElements = (
  nodes: IdentityNode[],
  recentStrengthChanges: Record<string, number> = {},
  dailyActionNodeIds: string[] = []
) => {
  const flowNodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Calculate stats for Growth Core
  const totalNodes = nodes.length;
  const avgStrength = totalNodes > 0 
    ? Math.round(nodes.reduce((sum, n) => sum + (n.strength || 50), 0) / totalNodes)
    : 0;
  const masteredCount = nodes.filter(n => n.status === 'mastered').length;
  const level = Math.floor((totalNodes + masteredCount * 3 + avgStrength / 10) / 5) + 1;
  
  // Add the central Growth Core node
  flowNodes.push({
    id: 'growth-core',
    type: 'growthCore',
    position: { x: CANVAS_CENTER.x - 90, y: CANVAS_CENTER.y - 90 },
    data: {
      totalNodes,
      avgStrength,
      masteredCount,
      level,
    },
    draggable: false,
  });

  // Group nodes by type
  const nodesByType: Record<string, IdentityNode[]> = {};
  nodes.forEach(node => {
    const type = node.type || 'trait';
    if (!nodesByType[type]) {
      nodesByType[type] = [];
    }
    nodesByType[type].push(node);
  });

  // Position nodes in organized grid clusters around the hexagon
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    const typeConfig = TYPE_POSITIONS[type] || TYPE_POSITIONS.trait;
    const angleRad = (typeConfig.angle * Math.PI) / 180;
    
    // Calculate center of this type's region
    const regionCenter = {
      x: CANVAS_CENTER.x + Math.cos(angleRad) * OUTER_RADIUS,
      y: CANVAS_CENTER.y + Math.sin(angleRad) * OUTER_RADIUS
    };

    // Sort by strength for visual hierarchy (strongest first)
    const sorted = [...typeNodes].sort((a, b) => (b.strength || 50) - (a.strength || 50));
    
    // Arrange in an organized grid pattern
    sorted.forEach((node, index) => {
      const position = calculateGridPosition(index, sorted.length, regionCenter);
      
      flowNodes.push({
        id: node.id,
        type: 'identityNode',
        position,
        data: {
          label: node.label,
          type: node.type,
          strength: node.strength,
          status: node.status,
          description: node.description,
          strengthChange: recentStrengthChanges[node.id] || undefined,
          hasDailyAction: dailyActionNodeIds.includes(node.id)
        },
        draggable: false,
      });

      // Create edge connecting this node to the growth core
      const isBeingWorkedOn = node.status === 'developing' || node.status === 'active';
      
      edges.push({
        id: `edge-${node.id}-to-core`,
        source: 'growth-core',
        target: node.id,
        type: 'default',
        animated: isBeingWorkedOn,
        style: {
          stroke: typeConfig.color,
          strokeWidth: isBeingWorkedOn ? 2.5 : 1.5,
          opacity: isBeingWorkedOn ? 0.5 : 0.2,
          strokeDasharray: isBeingWorkedOn ? '5,5' : 'none',
        },
      });
    });
  });

  return { nodes: flowNodes, edges };
};

// Calculate position in a clean grid layout
const calculateGridPosition = (
  index: number,
  total: number,
  regionCenter: { x: number; y: number }
): { x: number; y: number } => {
  // Fixed spacing between nodes - increased for visibility
  const NODE_SPACING = 180; // Space between node centers
  
  // Single node goes at center
  if (total === 1) {
    return { x: regionCenter.x - 55, y: regionCenter.y - 55 };
  }

  // Calculate optimal grid dimensions
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  
  // Position in grid
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // Center the grid around the region center
  const gridWidth = (cols - 1) * NODE_SPACING;
  const gridHeight = (rows - 1) * NODE_SPACING;
  
  const startX = regionCenter.x - gridWidth / 2 - 55; // Offset for node size
  const startY = regionCenter.y - gridHeight / 2 - 55;
  
  return {
    x: startX + col * NODE_SPACING,
    y: startY + row * NODE_SPACING
  };
};

export { CANVAS_CENTER };
