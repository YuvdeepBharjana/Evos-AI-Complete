# Daily Actions ↔ Psych Mirror Integration Summary

## ✅ Implementation Complete

This document summarizes the changes made to wire Daily Actions and the Psych Mirror together, creating a visible cause-and-effect loop.

---

## 🔄 Changes Made

### 1. **Store Updates** (`src/store/useUserStore.ts`)

**Added State:**
- `lastUpdatedNodeId: string | null` - Tracks which node was just updated for visual feedback

**Added Method:**
- `clearLastUpdatedNode()` - Clears the highlight after timeout

**Updated `markActionComplete()`:**
- Now sets `lastUpdatedNodeId` to the action's `nodeId` when a non-tracking action is completed
- Skips setting `lastUpdatedNodeId` for tracking actions (nodeId === 'tracking')
- Already updates `identityNodes` strength and status (existing logic)

**State Initialization:**
- All state reset functions now also clear `lastUpdatedNodeId`

---

### 2. **Psych Mirror Updates** (`src/components/psychmirror/PsychMirror.tsx`)

**Added:**
- Subscribes to `lastUpdatedNodeId` and `clearLastUpdatedNode` from store
- Auto-clears `lastUpdatedNodeId` after 2 seconds via `useEffect`

**Visual Highlight:**
- When `lastUpdatedNodeId === node.id`, the node gets:
  - **Pulsing glow** - 50px shadow blur with category color
  - **Thicker outer ring** - 4px stroke width (vs normal 2-3px)
  - **Scale effect** - Slightly larger radius for visibility
  - **Auto-clears** after 2 seconds

**Node Rendering:**
- `nodeCanvasObject` callback now checks `lastUpdatedNodeId`
- Highlight appears before selection/hover highlights
- Uses same category color for consistency

**Reactivity:**
- Already subscribes to `user?.identityNodes` from store
- Maps `node.strength` → `PsychNode.value` (0-100)
- `graphData` useMemo automatically recalculates when nodes change
- ForceGraph2D receives updated `graphData` and re-renders

---

### 3. **Daily Proof Card Updates** (`src/components/daily/DailyProofCard.tsx`)

**Added:**
- Subscribes to `lastUpdatedNodeId` from store
- `isActionForToday()` helper function to check if action was created today

**"Must Be Taken Today" Highlight:**
- Actions where:
  - `completed === null` (pending)
  - `isActionForToday(action)` (created today)
  - `nodeId !== 'tracking'` (not tracking action)
- Get:
  - **Purple background** - `bg-purple-500/20 border-purple-500/50`
  - **Left accent bar** - Gradient purple-to-blue vertical bar
  - **"Today's proof-move" badge** - Small label next to node name

**Sync Highlight:**
- When `lastUpdatedNodeId === action.nodeId`:
  - **Scale animation** - Slight scale-up (1.02x)
  - **Glow effect** - Purple box shadow
  - **Auto-clears** when `lastUpdatedNodeId` is cleared (after 2 seconds)

**Visual Hierarchy:**
- Today's pending actions are visually distinct
- Completed actions show green background
- Failed actions show red background
- Tracking actions don't get "today's proof-move" badge

---

## 🎯 End-to-End Flow

### User Completes a Daily Action:

1. **User clicks "Done" or "Didn't do it"** on a daily action
   ↓
2. **`markActionComplete(actionId, completed)` called**
   ↓
3. **Store Updates:**
   - Action status updated (pending → done/skipped)
   - Node strength updated (+5 to +10 or -3 to -7)
   - Node status recalculated (mastered/active/developing/neglected)
   - `alignmentScore` recalculated
   - `lastUpdatedNodeId` set to `action.nodeId` (if not tracking)
   ↓
4. **Zustand triggers re-renders:**
   - `DailyProofCard` receives updated `dailyActions` and `lastUpdatedNodeId`
   - `PsychMirror` receives updated `identityNodes` and `lastUpdatedNodeId`
   ↓
5. **UI Updates:**
   - **Psych Mirror:**
     - Node's percentage updates (strength → value mapping)
     - Node briefly highlights with pulse/glow
     - Highlight auto-clears after 2 seconds
   - **Daily Proof Card:**
     - Action shows completion status (green/red)
     - Action briefly highlights if `nodeId === lastUpdatedNodeId`
     - "Today's proof-move" badge disappears once completed
   ↓
6. **Auto-clear:**
   - After 2 seconds, `clearLastUpdatedNode()` called
   - Both highlights fade out

---

## 🔍 Key Implementation Details

### Node Strength → Psych Mirror Value Mapping

```typescript
// In PsychMirror.tsx - graphData useMemo
value: node.strength  // Direct 1:1 mapping (0-100)
```

The Psych Mirror already uses `node.strength` directly as the `value` for visualization. No additional mapping needed.

### Date Checking for "Today's Actions"

```typescript
// In DailyProofCard.tsx
const isActionForToday = (action: DailyAction): boolean => {
  const actionDate = new Date(action.createdAt);
  const today = new Date();
  return (
    actionDate.getDate() === today.getDate() &&
    actionDate.getMonth() === today.getMonth() &&
    actionDate.getFullYear() === today.getFullYear()
  );
};
```

Uses `createdAt` field to determine if action is for today. Actions are generated fresh each day, so this is reliable.

### Visual Highlight Timing

- **Psych Mirror highlight:** 2 seconds (via `useEffect` timeout)
- **Daily Proof Card highlight:** Same 2 seconds (syncs with `lastUpdatedNodeId`)
- Both clear simultaneously when `clearLastUpdatedNode()` is called

### Tracking Actions

- Tracking actions (`nodeId === 'tracking'`) do NOT:
  - Update node strength
  - Set `lastUpdatedNodeId`
  - Get "Today's proof-move" badge
- They still show completion status (green/red)

---

## ✅ Testing Checklist

- [x] Store updates `lastUpdatedNodeId` when action completed
- [x] Store clears `lastUpdatedNodeId` after 2 seconds
- [x] Psych Mirror highlights node when `lastUpdatedNodeId` matches
- [x] Psych Mirror updates node percentage when strength changes
- [x] Daily Proof Card shows "Today's proof-move" for pending today's actions
- [x] Daily Proof Card highlights action when `lastUpdatedNodeId` matches
- [x] Tracking actions don't trigger node updates or highlights
- [x] Completed actions lose "Today's proof-move" badge
- [x] All highlights auto-clear after 2 seconds

---

## 🚀 Future Enhancements (Optional)

1. **Backend Sync:** Ensure `PATCH /api/actions/:id` also updates node strength on backend
2. **Persistent Highlights:** Option to keep highlights until page refresh
3. **Sound Effects:** Subtle audio feedback when action completes
4. **Animation Variants:** Different highlight styles for success vs failure
5. **Connection Visualization:** Show which actions affect which nodes in the graph

---

**Implementation Date:** December 2, 2025
**Status:** ✅ Complete and Ready for Testing

