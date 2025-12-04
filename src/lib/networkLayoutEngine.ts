import type { IdentityNode } from '../types';
import type { Node, Edge } from 'reactflow';

// Growth Core is the origin - center of the canvas
const CANVAS_CENTER = { x: 1100, y: 750 };

// Distance from Growth Core to each category region
const CATEGORY_RADIUS = 550;

// Minimum spacing between node centers (must be larger than node visual size ~110px)
const NODE_SPACING = 150;

// 6 categories positioned in a perfect hexagon around the Growth Core (60° apart)
const TYPE_POSITIONS: Record<string, { angle: number; color: string }> = {
  goal: { angle: 270, color: '#3b82f6' },      // Top (12 o'clock)
  habit: { angle: 330, color: '#10b981' },     // Top right (2 o'clock)
  trait: { angle: 30, color: '#a855f7' },      // Bottom right (4 o'clock)
  interest: { angle: 90, color: '#06b6d4' },   // Bottom (6 o'clock)
  emotion: { angle: 150, color: '#f59e0b' },   // Bottom left (8 o'clock)
  struggle: { angle: 210, color: '#ef4444' },  // Top left (10 o'clock)
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
  
  // Add the central Growth Core node at origin
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

  // Position each category's nodes in their designated region
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    const typeConfig = TYPE_POSITIONS[type] || TYPE_POSITIONS.trait;
    const angleRad = (typeConfig.angle * Math.PI) / 180;
    
    // Calculate the center point of this category's region
    const regionCenter = {
      x: CANVAS_CENTER.x + Math.cos(angleRad) * CATEGORY_RADIUS,
      y: CANVAS_CENTER.y + Math.sin(angleRad) * CATEGORY_RADIUS
    };

    // Sort by strength (strongest first for visual hierarchy)
    const sorted = [...typeNodes].sort((a, b) => (b.strength || 50) - (a.strength || 50));
    
    // Position nodes in a non-overlapping arrangement
    const positions = calculateNonOverlappingPositions(sorted.length, regionCenter, NODE_SPACING);
    
    sorted.forEach((node, index) => {
      const position = positions[index];
      
      flowNodes.push({
        id: node.id,
        type: 'identityNode',
        position: { x: position.x - 55, y: position.y - 55 }, // Center the node
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

      // Create edge from Growth Core to this node
      const isBeingWorkedOn = node.status === 'developing' || node.status === 'active';
      
      edges.push({
        id: `edge-${node.id}-to-core`,
        source: 'growth-core',
        target: node.id,
        type: 'default',
        animated: isBeingWorkedOn,
        style: {
          stroke: typeConfig.color,
          strokeWidth: isBeingWorkedOn ? 2 : 1,
          opacity: isBeingWorkedOn ? 0.4 : 0.15,
          strokeDasharray: isBeingWorkedOn ? '8,4' : 'none',
        },
      });
    });
  });

  return { nodes: flowNodes, edges };
};

// Calculate positions that guarantee no overlap using a honeycomb/hex pattern
const calculateNonOverlappingPositions = (
  count: number,
  regionCenter: { x: number; y: number },
  spacing: number
): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  
  if (count === 0) return positions;
  
  // Single node goes at region center
  if (count === 1) {
    return [{ x: regionCenter.x, y: regionCenter.y }];
  }
  
  // Use a honeycomb pattern - nodes arranged in concentric hexagonal rings
  // This naturally prevents overlap and looks organic
  
  // First node at center
  positions.push({ x: regionCenter.x, y: regionCenter.y });
  
  if (count === 1) return positions;
  
  // Add nodes in rings around the center
  let ring = 1;
  let placed = 1;
  
  while (placed < count) {
    // Each ring has 6 * ring nodes
    const nodesInRing = 6 * ring;
    const ringRadius = spacing * ring;
    
    for (let i = 0; i < nodesInRing && placed < count; i++) {
      // Calculate angle for this position in the ring
      const angle = (i / nodesInRing) * Math.PI * 2 - Math.PI / 2; // Start from top
      
      positions.push({
        x: regionCenter.x + Math.cos(angle) * ringRadius,
        y: regionCenter.y + Math.sin(angle) * ringRadius
      });
      placed++;
    }
    ring++;
  }
  
  return positions;
};

export { CANVAS_CENTER };
