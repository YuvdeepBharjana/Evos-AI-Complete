import type { IdentityNode } from '../types';
import type { Node, Edge } from 'reactflow';

// Large canvas with hexagon arrangement for maximum separation between categories
const CANVAS_CENTER = { x: 1100, y: 700 }; // Shifted right for better centering with legend
const OUTER_RADIUS = 450; // Distance from center to each type's center (reduced for better zoom)

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

  // Position nodes in clusters around the hexagon
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    const typeConfig = TYPE_POSITIONS[type] || TYPE_POSITIONS.trait;
    const angleRad = (typeConfig.angle * Math.PI) / 180;
    
    // Calculate center of this type's region
    const regionCenter = {
      x: CANVAS_CENTER.x + Math.cos(angleRad) * OUTER_RADIUS,
      y: CANVAS_CENTER.y + Math.sin(angleRad) * OUTER_RADIUS
    };

    // Sort by strength for visual hierarchy
    const sorted = [...typeNodes].sort((a, b) => (b.strength || 50) - (a.strength || 50));
    
    // Arrange in a circular cluster pattern
    sorted.forEach((node, index) => {
      const position = calculateClusterPosition(
        index, 
        sorted.length, 
        regionCenter,
        node.strength || 50
      );
      
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
        draggable: false, // Prevent nodes from being dragged
      });

      // Create edge connecting this node to the growth core
      // Use dotted/dashed animated lines for developing/active nodes
      const isBeingWorkedOn = node.status === 'developing' || node.status === 'active';
      
      edges.push({
        id: `edge-${node.id}-to-core`,
        source: 'growth-core',
        target: node.id,
        type: 'default',
        animated: isBeingWorkedOn, // Animate for developing/active nodes
        style: {
          stroke: typeConfig.color,
          strokeWidth: isBeingWorkedOn ? 3 : 2.5, // Thicker lines
          opacity: isBeingWorkedOn ? 0.6 : 0.3,
          strokeDasharray: isBeingWorkedOn ? '5,5' : 'none', // Dotted line for in-progress nodes
        },
      });
    });
  });

  return { nodes: flowNodes, edges };
};

const calculateClusterPosition = (
  index: number,
  total: number,
  regionCenter: { x: number; y: number },
  strength: number
): { x: number; y: number } => {
  // Single node goes at center
  if (total === 1) {
    return { x: regionCenter.x, y: regionCenter.y };
  }

  // Calculate spacing based on number of nodes (reduced for tighter clustering)
  const baseRadius = 50;
  const radiusPerNode = 15;
  const clusterRadius = baseRadius + Math.min(total, 8) * radiusPerNode;
  
  // Strength affects distance from center (stronger = closer to center)
  const strengthFactor = (strength || 50) / 100;
  const adjustedRadius = clusterRadius * (1.05 - strengthFactor * 0.15);
  
  // Arrange in concentric rings if many nodes
  const nodesPerRing = 8;
  const ring = Math.floor(index / nodesPerRing);
  const indexInRing = index % nodesPerRing;
  const totalInRing = Math.min(nodesPerRing, total - ring * nodesPerRing);
  
  // Calculate angle for this node
  const startAngle = ring * 0.3;
  const angleStep = (2 * Math.PI) / totalInRing;
  const angle = startAngle + indexInRing * angleStep;
  
  // Ring distance increases for outer rings (reduced spacing)
  const ringRadius = adjustedRadius + ring * 60;
  
  return {
    x: regionCenter.x + Math.cos(angle) * ringRadius,
    y: regionCenter.y + Math.sin(angle) * ringRadius
  };
};

export { CANVAS_CENTER };
