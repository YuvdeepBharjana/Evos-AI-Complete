# Trading Day System Documentation

## Overview

The Trading Day System is the **core discipline tracking mechanism** for Evos AI. It classifies each trading day as GREEN, RED, or NEUTRAL based on whether the trader completed their rituals and followed their rules.

---

## Core Concept

Every trading day has **two mandatory rituals** and **one evaluation**:

1. **Pre-Market Calibration** (before trading starts)
2. **Post-Market Review** (after trading ends)
3. **Rules Adherence** (did you follow your trading rules?)

The system automatically computes a **Final Status** based on these three factors.

---

## Status Classification

### GREEN (Disciplined)
- ✅ Pre-Market completed
- ✅ Post-Market completed
- ✅ Rules followed

### RED (Broke Discipline)
- ❌ Pre-Market skipped
- OR ❌ Post-Market skipped
- OR ❌ Rules broken

### NEUTRAL (No Trades)
- ✅ Pre-Market completed
- ✅ Post-Market completed
- ⚪ No trades taken (rulesFollowed = null)

---

## Files Created

### 1. Type Definition
**Location:** `/src/types/tradingDay.ts`

Defines the `TradingDay` type with all fields and validation rules.

### 2. Zustand Store
**Location:** `/src/store/useTradingDayStore.ts`

Manages state, actions, and localStorage persistence.

---

## How to Use

### Initialize Today's Trading Day

Call this when the app loads (e.g., in a `useEffect` on app mount):

```typescript
import { useTradingDayStore } from './store/useTradingDayStore';

function App() {
  useEffect(() => {
    useTradingDayStore.getState().initializeToday();
  }, []);
}
```

This will:
- Load today's day if it exists
- Create a new one if it doesn't
- Archive unclosed days from the past as RED

---

### Complete Pre-Market Calibration

When the user finishes their pre-market ritual:

```typescript
const { completePreMarket } = useTradingDayStore();

function handlePreMarketComplete() {
  completePreMarket();
  // Navigate to trading interface or show success message
}
```

---

### Complete Post-Market Review

When the user finishes their post-market ritual:

```typescript
const { completePostMarket } = useTradingDayStore();

function handlePostMarketComplete() {
  completePostMarket();
  // Show day summary or close day
}
```

**Safety Check:** This will fail if pre-market wasn't completed first.

---

### Set Rules Adherence

After the trading session, the user evaluates whether they followed their rules:

```typescript
const { setRulesFollowed } = useTradingDayStore();

// They followed all rules
setRulesFollowed(true);

// They broke at least one rule
setRulesFollowed(false);

// They didn't take any trades
setRulesFollowed(null);
```

---

### Close the Day

When the user is done for the day and wants to finalize:

```typescript
const { closeDay } = useTradingDayStore();

function handleCloseDay() {
  closeDay();
  // Show final status (GREEN/RED/NEUTRAL)
  // Day is now immutable
}
```

**Safety Checks:**
- Will fail if post-market isn't completed
- Cannot close an already closed day

---

### Get Current Day Status

To show a preview of what the status would be if closed right now:

```typescript
import { getCurrentDayStatusPreview } from './store/useTradingDayStore';

const previewStatus = getCurrentDayStatusPreview();
// Returns "green" | "red" | "neutral" | null
```

---

### Get Statistics

To display trader's overall discipline stats:

```typescript
import { getTradingDayStats } from './store/useTradingDayStore';

const stats = getTradingDayStats();
console.log(stats);
// {
//   totalDays: 30,
//   greenDays: 18,
//   redDays: 10,
//   neutralDays: 2,
//   greenPercentage: 60
// }
```

---

## Safety Rules (Built-In)

### 1. Immutability
Once `isClosed === true`, the day **cannot be modified**. Any attempt will log an error.

### 2. Ritual Order
You **cannot** complete post-market without completing pre-market first.

### 3. Cannot Close Incomplete Days
You **cannot** close a day if post-market review is incomplete.

### 4. Auto-Archive
If yesterday's day exists but wasn't closed, it's automatically archived as RED when you initialize today.

---

## Data Persistence

All data is stored in **localStorage**:

- `evos.currentTradingDay` - Today's active day
- `evos.tradingDayHistory` - Array of all closed days

To clear all trading day data (for testing):

```javascript
localStorage.removeItem('evos.currentTradingDay');
localStorage.removeItem('evos.tradingDayHistory');
```

---

## Example UI Integration

### Pre-Market Calibration Page

```typescript
import { useTradingDayStore } from '@/store/useTradingDayStore';

export function PreMarketPage() {
  const { currentDay, completePreMarket } = useTradingDayStore();
  
  if (!currentDay) {
    return <div>Loading...</div>;
  }
  
  if (currentDay.preMarketCompleted) {
    return <div>✅ Pre-Market already completed!</div>;
  }
  
  return (
    <div>
      <h1>Pre-Market Identity Calibration</h1>
      {/* Your calibration questions here */}
      <button onClick={completePreMarket}>
        Complete Pre-Market
      </button>
    </div>
  );
}
```

### Dashboard Status Indicator

```typescript
import { useTradingDayStore, getCurrentDayStatusPreview } from '@/store/useTradingDayStore';

export function DisciplineStatus() {
  const { currentDay } = useTradingDayStore();
  const previewStatus = getCurrentDayStatusPreview();
  
  if (!currentDay) return null;
  
  return (
    <div>
      <h2>Today's Status: {previewStatus?.toUpperCase()}</h2>
      <div>
        Pre-Market: {currentDay.preMarketCompleted ? '✅' : '❌'}
      </div>
      <div>
        Post-Market: {currentDay.postMarketCompleted ? '✅' : '❌'}
      </div>
      <div>
        Rules: {currentDay.rulesFollowed === null ? '⚪' : currentDay.rulesFollowed ? '✅' : '❌'}
      </div>
    </div>
  );
}
```

### Calendar View (Past Days)

```typescript
import { useTradingDayStore } from '@/store/useTradingDayStore';

export function CalendarView() {
  const { history } = useTradingDayStore();
  
  return (
    <div>
      <h2>Trading History</h2>
      {history.map(day => (
        <div key={day.id} className={`day-${day.finalStatus}`}>
          <span>{day.date}</span>
          <span>{day.finalStatus?.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Daily Checklist Page

A complete Daily Checklist UI has been built at `/src/pages/DailyChecklistPage.tsx`.

This page provides the core discipline interface with three actions:
1. Pre-Market Analysis
2. Post-Market Review
3. Discipline Tracker (Close Day)

### To Add to Your Router:

```typescript
import { DailyChecklistPage } from './pages/DailyChecklistPage';

// In your route definitions:
<Route path="/checklist" element={<DailyChecklistPage />} />
```

### Features:
- ✅ Automatic initialization of today's trading day
- ✅ Visual completion indicators (checkmarks)
- ✅ Safety validations (correct order enforcement)
- ✅ Rules adherence modal (Yes/No/No trades)
- ✅ Final status display (GREEN/RED/NEUTRAL)
- ✅ Locked state after day closes

---

## Future Extensions

This system is designed to support:

1. **Calendar View** - Visual representation of green/red days
2. **Scaling Tracker** - Track discipline as account grows
3. **AI Summaries** - "You've had 5 red days this month due to skipping pre-market"
4. **Streak Tracking** - "7 green days in a row!"
5. **Pattern Analysis** - "You break rules most often on Fridays"

---

## Why This Architecture?

1. **Frontend-First** - Works immediately without backend
2. **Type-Safe** - TypeScript catches errors at compile time
3. **Immutable History** - Past days can't be changed (honesty enforcement)
4. **Automatic Status** - No gaming the system (status is computed, not set)
5. **Safety Checks** - Prevents illogical states (closing incomplete days, etc.)

---

## Testing

To test the system:

1. Initialize today: `useTradingDayStore.getState().initializeToday()`
2. Complete pre-market: `useTradingDayStore.getState().completePreMarket()`
3. Set rules: `useTradingDayStore.getState().setRulesFollowed(true)`
4. Complete post-market: `useTradingDayStore.getState().completePostMarket()`
5. Close day: `useTradingDayStore.getState().closeDay()`
6. Check history: `useTradingDayStore.getState().history`

---

## Questions?

Read the code comments in:
- `/src/types/tradingDay.ts`
- `/src/store/useTradingDayStore.ts`

Every function is documented with what it does and why.
