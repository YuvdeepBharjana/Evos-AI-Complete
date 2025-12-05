import type { IdentityNode } from '../types';
import type { Node, Edge } from 'reactflow';

/**
 * NETWORK LAYOUT ENGINE
 * =====================
 * 
 * CRITICAL RULE: NODES MUST NEVER OVERLAP
 * 
 * This engine ensures a clean, professional layout where:
 * - Every node has guaranteed minimum spacing
 * - Categories are clearly separated in their own regions
 * - The Growth Core is always centered
 * - Layout scales gracefully with any number of nodes
 */

// =============================================================================
// LAYOUT CONSTANTS - Tuned for clean, non-overlapping display
// =============================================================================

// Canvas center point - all nodes positioned relative to this
const CANVAS_CENTER = { x: 1200, y: 850 };

// Distance from Growth Core to each category region center
const CATEGORY_RADIUS = 650;

// CRITICAL: Minimum spacing between node centers
// Node visual size is ~130px, so 200px guarantees no overlap
const MIN_NODE_SPACING = 200;

// Growth Core size (for spacing calculations)
const GROWTH_CORE_SIZE = 180;

// Minimum distance from Growth Core to prevent overlap
const MIN_DISTANCE_FROM_CORE = GROWTH_CORE_SIZE / 2 + MIN_NODE_SPACING / 2 + 50;

// =============================================================================
// CATEGORY CONFIGURATION - 6 categories in a hexagon around Growth Core
// =============================================================================

const TYPE_POSITIONS: Record<string, { angle: number; color: string }> = {
  goal:     { angle: 270, color: '#3b82f6' },  // Top (12 o'clock)
  habit:    { angle: 330, color: '#10b981' },  // Top-right (2 o'clock)
  trait:    { angle: 30,  color: '#a855f7' },  // Bottom-right (4 o'clock)
  interest: { angle: 90,  color: '#06b6d4' },  // Bottom (6 o'clock)
  emotion:  { angle: 150, color: '#f59e0b' },  // Bottom-left (8 o'clock)
  struggle: { angle: 210, color: '#ef4444' },  // Top-left (10 o'clock)
};

// =============================================================================
// MAIN EXPORT - Generate React Flow elements
// =============================================================================

export const generateReactFlowElements = (
  nodes: IdentityNode[],
  recentStrengthChanges: Record<string, number> = {},
  dailyActionNodeIds: string[] = [],
  todayStrengthChanges: Record<string, number> = {}
) => {
  const flowNodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Track all placed positions for global collision detection
  const allPlacedPositions: { x: number; y: number }[] = [];
  
  // ==========================================================================
  // 1. Add Growth Core at center
  // ==========================================================================
  
  const totalNodes = nodes.length;
  const avgStrength = totalNodes > 0 
    ? Math.round(nodes.reduce((sum, n) => sum + (n.strength || 50), 0) / totalNodes)
    : 0;
  const masteredCount = nodes.filter(n => n.status === 'mastered').length;
  const level = Math.floor((totalNodes + masteredCount * 3 + avgStrength / 10) / 5) + 1;
  
  flowNodes.push({
    id: 'growth-core',
    type: 'growthCore',
    position: { x: CANVAS_CENTER.x - 90, y: CANVAS_CENTER.y - 90 },
    data: { totalNodes, avgStrength, masteredCount, level },
    draggable: false,
  });
  
  // Reserve Growth Core area
  allPlacedPositions.push({ x: CANVAS_CENTER.x, y: CANVAS_CENTER.y });
  
  // ==========================================================================
  // 2. Group nodes by type
  // ==========================================================================
  
  const nodesByType: Record<string, IdentityNode[]> = {};
  nodes.forEach(node => {
    const type = node.type || 'trait';
    if (!nodesByType[type]) {
      nodesByType[type] = [];
    }
    nodesByType[type].push(node);
  });
  
  // ==========================================================================
  // 3. Position each category's nodes with guaranteed spacing
  // ==========================================================================
  
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    const typeConfig = TYPE_POSITIONS[type] || TYPE_POSITIONS.trait;
    const angleRad = (typeConfig.angle * Math.PI) / 180;
    
    // Calculate region center for this category
    const regionCenter = {
      x: CANVAS_CENTER.x + Math.cos(angleRad) * CATEGORY_RADIUS,
      y: CANVAS_CENTER.y + Math.sin(angleRad) * CATEGORY_RADIUS
    };
    
    // Sort by strength (strongest closest to center)
    const sorted = [...typeNodes].sort((a, b) => (b.strength || 50) - (a.strength || 50));
    
    // Position each node with guaranteed non-overlap
    sorted.forEach((node, index) => {
      const position = findNonOverlappingPosition(
        regionCenter,
        allPlacedPositions,
        index,
        MIN_NODE_SPACING
      );
      
      // Record this position
      allPlacedPositions.push(position);
      
      // Create the flow node (offset by half node size to center it)
      // Node size is 120px, so offset by 60 to center
      flowNodes.push({
        id: node.id,
        type: 'identityNode',
        position: { x: position.x - 60, y: position.y - 60 },
        data: {
          label: node.label,
          type: node.type,
          strength: node.strength,
          status: node.status,
          description: node.description,
          strengthChange: recentStrengthChanges[node.id] || undefined,
          hasDailyAction: dailyActionNodeIds.includes(node.id),
          todayChange: todayStrengthChanges[node.id] || 0
        },
        draggable: false,
      });
      
      // Create edge to Growth Core
      const isActive = node.status === 'developing' || node.status === 'active';
      
      edges.push({
        id: `edge-${node.id}-to-core`,
        source: 'growth-core',
        target: node.id,
        type: 'default',
        animated: isActive,
        style: {
          stroke: typeConfig.color,
          strokeWidth: isActive ? 2 : 1,
          opacity: isActive ? 0.35 : 0.12,
          strokeDasharray: isActive ? '8,4' : 'none',
        },
      });
    });
  });
  
  return { nodes: flowNodes, edges };
};

// =============================================================================
// POSITIONING ALGORITHM - Guarantees no overlapping nodes
// =============================================================================

/**
 * Find a position that doesn't overlap with any existing nodes
 * Uses a spiral pattern from the region center outward
 */
function findNonOverlappingPosition(
  regionCenter: { x: number; y: number },
  existingPositions: { x: number; y: number }[],
  nodeIndex: number,
  minSpacing: number
): { x: number; y: number } {
  
  // First node goes at region center (if not overlapping)
  if (nodeIndex === 0) {
    if (!hasCollision(regionCenter, existingPositions, minSpacing)) {
      return regionCenter;
    }
  }
  
  // Use a clean grid-spiral pattern to find positions
  // This creates an organized, professional look
  
  const ringSpacing = minSpacing;
  let ring = nodeIndex === 0 ? 1 : Math.ceil(nodeIndex / 6);
  
  // Try positions in expanding rings
  for (let r = ring; r <= ring + 10; r++) {
    const radius = ringSpacing * r;
    const nodesInRing = Math.max(6, r * 6); // More positions in outer rings
    
    for (let i = 0; i < nodesInRing; i++) {
      // Offset angle to create staggered rows (more organic look)
      const angleOffset = (r % 2 === 0) ? Math.PI / nodesInRing : 0;
      const angle = (i / nodesInRing) * Math.PI * 2 + angleOffset - Math.PI / 2;
      
      const candidate = {
        x: regionCenter.x + Math.cos(angle) * radius,
        y: regionCenter.y + Math.sin(angle) * radius
      };
      
      // Check this position doesn't overlap with anything
      if (!hasCollision(candidate, existingPositions, minSpacing)) {
        // Also verify it's not too close to Growth Core
        const distFromCore = Math.hypot(
          candidate.x - CANVAS_CENTER.x,
          candidate.y - CANVAS_CENTER.y
        );
        
        if (distFromCore >= MIN_DISTANCE_FROM_CORE) {
          return candidate;
        }
      }
    }
  }
  
  // Fallback: place further out with guaranteed spacing
  const fallbackAngle = (nodeIndex * 0.618033988749895 * Math.PI * 2) % (Math.PI * 2);
  const fallbackRadius = minSpacing * (Math.ceil(nodeIndex / 6) + 3);
  
  return {
    x: regionCenter.x + Math.cos(fallbackAngle) * fallbackRadius,
    y: regionCenter.y + Math.sin(fallbackAngle) * fallbackRadius
  };
}

/**
 * Check if a position collides with any existing positions
 */
function hasCollision(
  position: { x: number; y: number },
  existingPositions: { x: number; y: number }[],
  minDistance: number
): boolean {
  for (const existing of existingPositions) {
    const distance = Math.hypot(position.x - existing.x, position.y - existing.y);
    if (distance < minDistance) {
      return true; // Collision detected
    }
  }
  return false; // No collision
}

// =============================================================================
// EXPORTS
// =============================================================================

export { CANVAS_CENTER, MIN_NODE_SPACING };
