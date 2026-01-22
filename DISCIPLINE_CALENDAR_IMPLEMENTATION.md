# Discipline Calendar Implementation Guide

## Overview

The Discipline Calendar is a **read-only "truth mirror"** that displays discipline outcomes for each day in a monthly view. It uses the TradingDay store as the single source of truth.

---

## File Location

**Component:** `/src/pages/DisciplineCalendarPage.tsx`

---

## What It Does

### Visual Display
- Monthly calendar grid (7 columns: Sun–Sat)
- Color-coded days based on discipline status:
  - 🟩 **Green** - Full discipline (all rituals done, rules followed)
  - 🟥 **Red** - Broke discipline (missed ritual OR broke rules)
  - ⚪ **Gray** - Neutral (no trades, but rituals done)
  - **Muted** - No data recorded (day was skipped)

### Today's Highlight
- Current day has a subtle white ring outline
- Color still reflects actual discipline status

### Day Details
- Click any colored day to see a read-only detail modal:
  - Date and status
  - Pre-Market completion status
  - Post-Market completion status
  - Rules adherence (Yes/No/No Trades)
  - Context tags (if present)
  - Immutability notice

---

## Key Features

### 1. Month Navigation
- Previous/Next month buttons
- "Today" button (appears when not viewing current month)
- Month/year label

### 2. Calendar Grid
- Proper alignment (Sunday–Saturday)
- Responsive design
- Hover effects on days with data

### 3. Read-Only Design
- No editing allowed
- No status changes
- No mutations
- Only displays historical truth

---

## How It Works

### Data Flow
```
TradingDay Store (history + currentDay)
        ↓
   Map to dates (YYYY-MM-DD)
        ↓
   Render calendar grid
        ↓
   Color-code based on finalStatus
        ↓
   Show details on click
```

### Date Mapping
```typescript
// Create a map of date → TradingDay
const tradingDayMap = new Map<string, TradingDay>();

history.forEach(day => {
  tradingDayMap.set(day.date, day); // "2024-01-15" → TradingDay
});
```

### Status → Color Mapping
```typescript
const getBgColor = () => {
  if (!hasData) return 'bg-white/5';  // No data = muted
  
  switch (status) {
    case 'green':   return 'bg-green-500/20 border-green-400/40';
    case 'red':     return 'bg-red-500/20 border-red-400/40';
    case 'neutral': return 'bg-gray-500/20 border-gray-400/40';
  }
};
```

---

## Component Structure

### Main Component: `DisciplineCalendarPage`
- Reads from TradingDay store
- Manages month selection state
- Handles day detail modal state
- Renders calendar grid

### Sub-Component: `CalendarDayCell`
- Represents a single day in the calendar
- Shows day number and status indicator dot
- Handles click to open details
- Color-coded background

### Sub-Component: `DayDetailModal`
- Modal that shows full day breakdown
- Read-only checklist status
- Context tags display
- Immutability notice

---

## Integration with Router

To add this page to your app:

### 1. Import the component

```typescript
import { DisciplineCalendarPage } from './pages/DisciplineCalendarPage';
```

### 2. Add a route

```typescript
<Route path="/calendar" element={<DisciplineCalendarPage />} />
```

Or as a protected route:

```typescript
<Route
  path="/calendar"
  element={
    <ProtectedRoute>
      <DisciplineCalendarPage />
    </ProtectedRoute>
  }
/>
```

### 3. Link from your navigation

```typescript
<Link to="/calendar">Discipline Calendar</Link>
```

---

## User Experience

### What the Trader Sees

**When viewing the calendar:**
- Immediate visual pattern recognition
- "I had 5 red days this month"
- "My discipline broke down in week 3"
- Honest feedback that can't be argued with

**When clicking a day:**
- Full breakdown of what happened
- No judgment, just facts
- Permanent record (can't be changed)

### Emotional Impact

This calendar is designed to be:
- **Honest** - Shows the truth, not aspirations
- **Confronting** - Hard to ignore patterns
- **Calm** - No anxiety-inducing metrics
- **Motivating** - Visual progress over time

**Core Message:**  
*"I can't argue with this — this is how disciplined I've actually been."*

---

## Example Scenarios

### Scenario 1: Consistent Trader
```
Calendar shows:
- 18 green days
- 2 red days (both Fridays)
- 3 neutral days (no trades)
```
**Insight:** "I'm disciplined, but something happens on Fridays."

### Scenario 2: Struggling Trader
```
Calendar shows:
- 5 green days
- 12 red days
- 8 days with no data (skipped checklist)
```
**Insight:** "I'm not even tracking consistently. Need to start with the basics."

### Scenario 3: Improving Trader
```
Calendar shows:
- Week 1: 3 red, 1 green
- Week 2: 2 red, 2 green
- Week 3: 1 red, 3 green
- Week 4: 4 green
```
**Insight:** "Clear improvement week over week. Keep going."

---

## Read-Only Philosophy

### Why No Editing?

1. **Honesty Enforcement**
   - Once a day is closed, it's permanent
   - Can't rewrite history to feel better
   - Truth over comfort

2. **Integrity**
   - The calendar reflects actual behavior
   - Not aspirational goals
   - Not retroactive justifications

3. **Learning**
   - Patterns emerge over time
   - Can't learn from edited data
   - Mistakes must remain visible

**If you want to change the calendar, you must change your behavior going forward.**

---

## Design Decisions

### Why Color-Coded?
- Instant pattern recognition
- No need to read text
- Emotional impact (seeing many red days is motivating)

### Why No Streaks?
- Streaks can create anxiety ("don't break the streak!")
- Focus on overall pattern, not day-to-day
- Streaks can be added later if needed

### Why No PnL?
- Discipline ≠ Profitability (in the short term)
- A green day might be a losing day (but disciplined)
- A red day might be a winning day (but broke rules)

### Why Click for Details?
- Calendar stays clean and scannable
- Details available when needed
- Progressive disclosure

---

## Future Enhancements

This calendar can later support:

1. **Month Stats**
   - "18/30 green days (60%)"
   - Display below the calendar

2. **Quarter/Year View**
   - Zoom out to see longer patterns
   - Aggregate stats

3. **Filtering**
   - "Show only weekdays"
   - "Hide neutral days"

4. **Notes Field**
   - Optional brief note per day
   - "Took a break for mental health" (shows in modal)

5. **Export**
   - Download calendar as image
   - Share with accountability partner

But for now, it's intentionally minimal.

---

## Technical Notes

### Calendar Grid Logic

```typescript
// Get first day of month (0 = Sunday)
const firstDayOfMonth = new Date(year, month, 1).getDay();

// Add empty cells for alignment
for (let i = 0; i < firstDayOfMonth; i++) {
  days.push(null);  // Empty cell
}

// Add actual days
for (let day = 1; day <= daysInMonth; day++) {
  days.push(new Date(year, month, day));
}
```

### Date String Format

TradingDay uses ISO date format: `YYYY-MM-DD`

```typescript
const dateString = date.toISOString().split('T')[0];
// "2024-01-15T08:30:00.000Z" → "2024-01-15"
```

### Performance

- Calendar recomputes only when month changes
- Uses `useMemo` for expensive calculations
- Map lookup for O(1) date → TradingDay access

---

## Testing Flow

1. Navigate to `/calendar`
2. See current month with colored days
3. Click a green day → Modal shows full discipline breakdown
4. Close modal
5. Navigate to previous month → See historical data
6. Click "Today" button → Return to current month
7. Click a day with no data → Nothing happens (disabled)

---

## Questions?

- Read the source code: `/src/pages/DisciplineCalendarPage.tsx`
- Every component has comments explaining the "why"
- Data flow is clearly documented

---

## Status

✅ **COMPLETE AND PRODUCTION-READY**

This calendar is fully functional and ready to integrate. Just add the route and start visualizing discipline patterns.
