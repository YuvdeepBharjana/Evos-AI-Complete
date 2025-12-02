import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyMetric, DailyMetricEntry, IdentityNode, NodeStatus } from '../types';

// ============================================
// Types for Psych Mirror integration
// ============================================

export type NodeCategory = 'Goal' | 'Habit' | 'Trait' | 'Emotion' | 'Struggle';
export type NodeState = 'critical' | 'developing' | 'dominant';

export interface PsychNode {
  id: string;
  label: string;
  value: number;      // 0–100
  category: NodeCategory;
  state?: NodeState;
}

export interface PsychEdge {
  id?: string;
  source: string;
  target: string;
  weight: number;
}

// ============================================
// Default Metrics
// ============================================

const DEFAULT_METRICS: DailyMetric[] = [
  {
    id: 'calories',
    label: 'Calories',
    unit: 'cal',
    type: 'number',
    target: 2000,
    isDefault: true,
    isActive: true,
    icon: 'Flame',
    color: '#f97316'
  },
  {
    id: 'exercise',
    label: 'Exercise',
    unit: 'min',
    type: 'number',
    target: 30,
    isDefault: true,
    isActive: true,
    icon: 'Dumbbell',
    color: '#22c55e'
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    unit: 'hrs',
    type: 'number',
    target: 4,
    isDefault: true,
    isActive: true,
    icon: 'Briefcase',
    color: '#3b82f6'
  },
  {
    id: 'sleep',
    label: 'Sleep',
    unit: 'hrs',
    type: 'number',
    target: 8,
    isDefault: true,
    isActive: true,
    icon: 'Moon',
    color: '#6366f1'
  },
  {
    id: 'mood',
    label: 'Mood',
    unit: '',
    type: 'scale_1_10',
    target: 7,
    isDefault: true,
    isActive: true,
    icon: 'Heart',
    color: '#ec4899'
  }
];

// ============================================
// Helper Functions
// ============================================

const getDateString = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};

const generateId = (): string => {
  return `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getNodeState = (value: number): NodeState => {
  if (value < 40) return 'critical';
  if (value < 70) return 'developing';
  return 'dominant';
};

const mapNodeTypeToCategory = (type: string): NodeCategory => {
  const mapping: Record<string, NodeCategory> = {
    'goal': 'Goal',
    'habit': 'Habit',
    'trait': 'Trait',
    'emotion': 'Emotion',
    'struggle': 'Struggle',
    'interest': 'Trait' // Map interest to Trait
  };
  return mapping[type.toLowerCase()] || 'Trait';
};

// ============================================
// Store Interface
// ============================================

interface IdentityStore {
  // Data
  metrics: DailyMetric[];
  entries: DailyMetricEntry[];
  
  // Metric Management
  addMetric: (metricInput: Omit<DailyMetric, 'id' | 'isDefault' | 'isActive'>) => void;
  updateMetric: (id: string, updates: Partial<DailyMetric>) => void;
  toggleMetricActive: (id: string) => void;
  deleteMetric: (id: string) => void;
  
  // Entry Management
  upsertEntry: (date: string | Date, metricId: string, value: number) => void;
  getEntriesForDate: (date: string | Date) => DailyMetricEntry[];
  getValueFor: (date: string | Date, metricId: string) => number | undefined;
  getEntriesForMetric: (metricId: string) => DailyMetricEntry[];
  
  // Psych Mirror Sync
  syncMirrorFromMetrics: (nodes: IdentityNode[], updateNode: (nodeId: string, change: number) => void) => void;
  
  // Utilities
  getActiveMetrics: () => DailyMetric[];
  getTrackingProgress: (date: string | Date) => { tracked: number; total: number; percentage: number };
}

// ============================================
// Store Implementation
// ============================================

export const useIdentityStore = create<IdentityStore>()(
  persist(
    (set, get) => ({
      metrics: DEFAULT_METRICS,
      entries: [],
      
      // ============================================
      // Metric Management
      // ============================================
      
      addMetric: (metricInput) => {
        const newMetric: DailyMetric = {
          ...metricInput,
          id: generateId(),
          isDefault: false,
          isActive: true
        };
        
        set((state) => ({
          metrics: [...state.metrics, newMetric]
        }));
      },
      
      updateMetric: (id, updates) => {
        set((state) => ({
          metrics: state.metrics.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          )
        }));
      },
      
      toggleMetricActive: (id) => {
        set((state) => ({
          metrics: state.metrics.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          )
        }));
      },
      
      deleteMetric: (id) => {
        set((state) => ({
          // Only delete non-default metrics
          metrics: state.metrics.filter((m) => m.id !== id || m.isDefault),
          // Also remove entries for this metric
          entries: state.entries.filter((e) => e.metricId !== id)
        }));
      },
      
      // ============================================
      // Entry Management
      // ============================================
      
      upsertEntry: (date, metricId, value) => {
        const dateStr = getDateString(date);
        
        set((state) => {
          const existingIndex = state.entries.findIndex(
            (e) => e.date === dateStr && e.metricId === metricId
          );
          
          if (existingIndex >= 0) {
            // Update existing entry
            const updatedEntries = [...state.entries];
            updatedEntries[existingIndex] = {
              ...updatedEntries[existingIndex],
              value
            };
            return { entries: updatedEntries };
          } else {
            // Create new entry
            const newEntry: DailyMetricEntry = {
              id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date: dateStr,
              metricId,
              value
            };
            return { entries: [...state.entries, newEntry] };
          }
        });
      },
      
      getEntriesForDate: (date) => {
        const dateStr = getDateString(date);
        return get().entries.filter((e) => e.date === dateStr);
      },
      
      getValueFor: (date, metricId) => {
        const dateStr = getDateString(date);
        const entry = get().entries.find(
          (e) => e.date === dateStr && e.metricId === metricId
        );
        return entry?.value;
      },
      
      getEntriesForMetric: (metricId) => {
        return get().entries.filter((e) => e.metricId === metricId);
      },
      
      // ============================================
      // Psych Mirror Sync
      // ============================================
      
      syncMirrorFromMetrics: (nodes, updateNode) => {
        const { metrics, entries } = get();
        
        // Get date range for last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // For each metric that has a linkedNodeId
        metrics.forEach((metric) => {
          if (!metric.linkedNodeId || !metric.isActive) return;
          
          // Get entries for this metric in the last 30 days
          const metricEntries = entries.filter((e) => {
            const entryDate = new Date(e.date);
            return (
              e.metricId === metric.id &&
              entryDate >= thirtyDaysAgo &&
              entryDate <= today
            );
          });
          
          if (metricEntries.length === 0) return;
          
          // Calculate habit score based on metric type
          let habitScore = 0;
          
          switch (metric.type) {
            case 'boolean': {
              // (days with value 1 / total days tracked) * 100
              const completedDays = metricEntries.filter((e) => e.value === 1).length;
              habitScore = (completedDays / metricEntries.length) * 100;
              break;
            }
            
            case 'scale_1_10': {
              // average / 10 * 100
              const sum = metricEntries.reduce((acc, e) => acc + e.value, 0);
              const avg = sum / metricEntries.length;
              habitScore = (avg / 10) * 100;
              break;
            }
            
            case 'number': {
              // Normalize using target if available
              if (metric.target && metric.target > 0) {
                // Average percentage of target achieved
                const percentages = metricEntries.map((e) =>
                  Math.min((e.value / metric.target!) * 100, 100)
                );
                habitScore = percentages.reduce((a, b) => a + b, 0) / percentages.length;
              } else {
                // Simple heuristic: assume 100 is the max
                const sum = metricEntries.reduce((acc, e) => acc + e.value, 0);
                const avg = sum / metricEntries.length;
                habitScore = Math.min(avg, 100);
              }
              break;
            }
          }
          
          // Find the linked node
          const linkedNode = nodes.find((n) => n.id === metric.linkedNodeId);
          if (!linkedNode) return;
          
          // Blend new score into node value: newValue = 0.7 * oldValue + 0.3 * habitScore
          const oldValue = linkedNode.strength;
          const newValue = Math.round(0.7 * oldValue + 0.3 * habitScore);
          const change = newValue - oldValue;
          
          // Update the node if there's a change
          if (change !== 0) {
            updateNode(metric.linkedNodeId, change);
          }
        });
      },
      
      // ============================================
      // Utilities
      // ============================================
      
      getActiveMetrics: () => {
        return get().metrics.filter((m) => m.isActive);
      },
      
      getTrackingProgress: (date) => {
        const activeMetrics = get().getActiveMetrics();
        const entriesForDate = get().getEntriesForDate(date);
        
        const trackedMetricIds = new Set(entriesForDate.map((e) => e.metricId));
        const tracked = activeMetrics.filter((m) => trackedMetricIds.has(m.id)).length;
        const total = activeMetrics.length;
        const percentage = total > 0 ? Math.round((tracked / total) * 100) : 0;
        
        return { tracked, total, percentage };
      }
    }),
    {
      name: 'evos-identity-store',
      partialize: (state) => ({
        metrics: state.metrics,
        entries: state.entries
      })
    }
  )
);

// ============================================
// Utility exports for Psych Mirror
// ============================================

export { getNodeState, mapNodeTypeToCategory };

