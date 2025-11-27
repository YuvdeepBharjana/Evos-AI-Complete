import type { IdentityNode } from '../types';
import type { Node, Edge } from 'reactflow';

export const generateReactFlowElements = (nodes: IdentityNode[]) => {
  // Convert IdentityNodes to React Flow nodes with force-directed layout
  const flowNodes: Node[] = [];
  const edges: Edge[] = [];

  // Calculate positions using a simple force-directed algorithm
  const positions = calculateForceDirectedLayout(nodes);

  nodes.forEach((node, index) => {
    flowNodes.push({
      id: node.id,
      type: 'identityNode',
      position: positions[index],
      data: {
        label: node.label,
        type: node.type,
        strength: node.strength,
        status: node.status,
        description: node.description
      }
    });

    // Create edges for connections
    node.connections.forEach((targetId) => {
      edges.push({
        id: `${node.id}-${targetId}`,
        source: node.id,
        target: targetId,
        type: 'smoothstep',
        animated: node.status === 'active',
        style: {
          stroke: getEdgeColor(node.type),
          strokeWidth: Math.max(1, node.strength / 30),
          opacity: node.strength / 150
        }
      });
    });
  });

  return { nodes: flowNodes, edges };
};

const getEdgeColor = (type: string) => {
  switch (type) {
    case 'habit':
      return '#10b981';
    case 'goal':
      return '#3b82f6';
    case 'trait':
      return '#a855f7';
    case 'emotion':
      return '#f59e0b';
    case 'struggle':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const calculateForceDirectedLayout = (nodes: IdentityNode[]) => {
  const positions: Array<{ x: number; y: number }> = [];
  const centerX = 400;
  const centerY = 300;
  const radius = 250;

  if (nodes.length === 1) {
    return [{ x: centerX, y: centerY }];
  }

  // Group nodes by type for better organization
  const nodesByType: Record<string, number[]> = {};
  nodes.forEach((node, index) => {
    if (!nodesByType[node.type]) {
      nodesByType[node.type] = [];
    }
    nodesByType[node.type].push(index);
  });

  const types = Object.keys(nodesByType);
  const typeSections = types.length;

  types.forEach((type, typeIndex) => {
    const nodeIndices = nodesByType[type];
    const sectionAngleStart = (typeIndex / typeSections) * Math.PI * 2;
    const sectionAngleEnd = ((typeIndex + 1) / typeSections) * Math.PI * 2;

    nodeIndices.forEach((nodeIndex, positionInSection) => {
      const node = nodes[nodeIndex];
      
      // Stronger nodes closer to center
      const strengthFactor = node.strength / 100;
      const nodeRadius = radius * (1 - strengthFactor * 0.3);

      // Distribute nodes within the type section
      const angleRange = sectionAngleEnd - sectionAngleStart;
      const angle = sectionAngleStart + (angleRange * (positionInSection + 1) / (nodeIndices.length + 1));

      positions[nodeIndex] = {
        x: centerX + Math.cos(angle) * nodeRadius,
        y: centerY + Math.sin(angle) * nodeRadius
      };
    });
  });

  return positions;
};

