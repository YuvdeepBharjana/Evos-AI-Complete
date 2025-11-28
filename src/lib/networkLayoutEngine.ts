import type { IdentityNode } from '../types';
import type { Node, Edge } from 'reactflow';

// Brain region positions - inspired by brain anatomy
const BRAIN_REGIONS = {
  // Prefrontal cortex - planning and goals (top)
  goal: { centerX: 400, centerY: 100, radius: 120 },
  // Motor cortex - habits and actions (left)
  habit: { centerX: 150, centerY: 300, radius: 100 },
  // Temporal lobe - traits and personality (right)
  trait: { centerX: 650, centerY: 250, radius: 110 },
  // Limbic system - emotions (bottom center)
  emotion: { centerX: 400, centerY: 450, radius: 100 },
  // Amygdala - struggles and fears (bottom right)
  struggle: { centerX: 580, centerY: 400, radius: 90 }
};

export const generateReactFlowElements = (
  nodes: IdentityNode[],
  recentStrengthChanges: Record<string, number> = {}
) => {
  const flowNodes: Node[] = [];
  const edges: Edge[] = [];

  // Group nodes by type
  const nodesByType: Record<string, IdentityNode[]> = {};
  nodes.forEach(node => {
    if (!nodesByType[node.type]) {
      nodesByType[node.type] = [];
    }
    nodesByType[node.type].push(node);
  });

  // Position nodes within their brain region
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    const region = BRAIN_REGIONS[type as keyof typeof BRAIN_REGIONS];
    if (!region) return;

    // Sort by strength - stronger nodes closer to center
    const sorted = [...typeNodes].sort((a, b) => b.strength - a.strength);

    sorted.forEach((node, index) => {
      const position = calculateNodePosition(index, sorted.length, region, node.strength);
      
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
          strengthChange: recentStrengthChanges[node.id] || undefined
        }
      });

      // Create axon-like edges (connections between neurons)
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        edges.push({
          id: `${node.id}-${targetId}`,
          source: node.id,
          target: targetId,
          type: 'smoothstep',
          animated: node.status === 'active' || node.status === 'mastered',
          style: {
            stroke: getEdgeColor(node.type, targetNode.type),
            strokeWidth: calculateAxonWidth(node.strength),
            opacity: calculateAxonOpacity(node.strength, node.status),
            strokeDasharray: node.status === 'developing' ? '5,5' : undefined
          }
        });
      });
    });
  });

  return { nodes: flowNodes, edges };
};

const calculateNodePosition = (
  index: number,
  totalInRegion: number,
  region: { centerX: number; centerY: number; radius: number },
  strength: number
): { x: number; y: number } => {
  if (totalInRegion === 1) {
    return { x: region.centerX, y: region.centerY };
  }

  // Spiral layout within region - stronger nodes at center
  const strengthFactor = strength / 100;
  const distanceFromCenter = region.radius * (1 - strengthFactor * 0.6);
  
  // Golden angle spiral for even distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  
  // Add slight random offset for organic feel
  const jitter = 10;
  const randomX = (Math.random() - 0.5) * jitter;
  const randomY = (Math.random() - 0.5) * jitter;

  return {
    x: region.centerX + Math.cos(angle) * distanceFromCenter + randomX,
    y: region.centerY + Math.sin(angle) * distanceFromCenter + randomY
  };
};

const getEdgeColor = (sourceType: string, targetType: string): string => {
  // Blend colors for cross-type connections
  const colors: Record<string, string> = {
    habit: '#10b981',
    goal: '#3b82f6',
    trait: '#a855f7',
    emotion: '#f59e0b',
    struggle: '#ef4444'
  };

  if (sourceType === targetType) {
    return colors[sourceType] || '#6b7280';
  }

  // Return gradient-like color for cross-type
  return `${colors[sourceType]}88`;
};

const calculateAxonWidth = (strength: number): number => {
  // Thicker axons for stronger connections
  return 1 + (strength / 100) * 2; // 1-3px
};

const calculateAxonOpacity = (strength: number, status: string): number => {
  const baseOpacity = strength / 150;
  if (status === 'mastered') return Math.min(baseOpacity + 0.3, 0.8);
  if (status === 'active') return Math.min(baseOpacity + 0.2, 0.7);
  if (status === 'neglected') return Math.max(baseOpacity - 0.2, 0.15);
  return baseOpacity;
};
