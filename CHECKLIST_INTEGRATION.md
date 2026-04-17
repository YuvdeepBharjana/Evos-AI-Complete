# Daily Checklist Integration Instructions

## Quick Start

Add the Daily Checklist page to your app in 3 steps:

---

## Step 1: Import the Component

In `/src/App.tsx`, add this import at the top with the other page imports:

```typescript
import { DailyChecklistPage } from './pages/DailyChecklistPage';
```

**Location:** After line 15 (after `HomePage` import)

---

## Step 2: Add the Route

Add this route in the "Protected Routes" section:

```typescript
<Route
  path="/checklist"
  element={
    <ProtectedRoute>
      <DailyChecklistPage />
    </ProtectedRoute>
  }
/>
```

**Location:** After line 146 (after `/home` route, before `<Route element={<AppLayout />}>`)

**Full context:**
```typescript
{/* Protected Routes */}
<Route
  path="/home"
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/checklist"
  element={
    <ProtectedRoute>
      <DailyChecklistPage />
    </ProtectedRoute>
  }
/>
<Route element={<AppLayout />}>
  {/* ... other routes ... */}
</Route>
```

---

## Step 3: Add Navigation Link (Optional)

If you want to add a link to the checklist from your sidebar or navigation:

### In Sidebar (`/src/components/layout/Sidebar.tsx`):

Add a new navigation item:

```typescript
<Link
  to="/checklist"
  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
>
  <CheckSquare className="w-5 h-5" />
  <span>Daily Checklist</span>
</Link>
```

Don't forget to import the icon:
```typescript
import { CheckSquare } from 'lucide-react';
```

### Or from HomePage (`/src/pages/HomePage.tsx`):

Add a new action card:

```typescript
<Link to="/checklist">
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-400/30 transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-3 mb-3">
      <CheckSquare className="w-6 h-6 text-green-400" />
      <h3 className="text-lg font-semibold">Daily Checklist</h3>
    </div>
    <p className="text-sm text-gray-400">
      Complete your three daily discipline actions
    </p>
  </motion.div>
</Link>
```

---

## Testing

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:5173/checklist`
3. You should see the Daily Checklist page
4. Test the three actions in order:
   - Complete Pre-Market
   - Complete Post-Market
   - Close Day (choose rules adherence)
5. Verify the final status appears
6. Refresh page → Status should persist

---

## Typical Flow

**Trader's Daily Routine:**

1. **Morning:** Visit `/checklist` → Complete Pre-Market
2. **Trading:** Use your trading platform (not in Evos)
3. **Evening:** Return to `/checklist` → Complete Post-Market
4. **Close:** Answer rules question → See GREEN/RED/NEUTRAL result
5. **Next Day:** New day auto-starts, checklist resets

---

## Integration with HomePage

If you want traders to land on `/home` first and then navigate to checklist:

**HomePage could show:**
- "Today's Status" preview card (pulls from TradingDay store)
- Button: "Go to Daily Checklist" → links to `/checklist`

**Example:**
```typescript
import { useTradingDayStore, getCurrentDayStatusPreview } from '../store/useTradingDayStore';

function HomePage() {
  const { currentDay } = useTradingDayStore();
  const statusPreview = getCurrentDayStatusPreview();
  
  return (
    <div>
      {/* Show current status */}
      <div className="p-4 bg-white/5 rounded-lg">
        <p>Today's Status: {statusPreview?.toUpperCase()}</p>
        <p>Pre-Market: {currentDay?.preMarketCompleted ? '✓' : '○'}</p>
        <p>Post-Market: {currentDay?.postMarketCompleted ? '✓' : '○'}</p>
      </div>
      
      {/* Link to checklist */}
      <Link to="/checklist" className="btn-primary">
        Go to Daily Checklist
      </Link>
    </div>
  );
}
```

---

## Alternative: Make Checklist the Home Page

If you want `/checklist` to be the main landing page after login:

**In `AuthRoute` component (App.tsx line 43):**

Change:
```typescript
if (user?.onboardingComplete) {
  return <Navigate to="/dashboard" replace />;
}
```

To:
```typescript
if (user?.onboardingComplete) {
  return <Navigate to="/checklist" replace />;
}
```

---

## Files Created

1. `/src/pages/DailyChecklistPage.tsx` - Main UI component
2. `/src/store/useTradingDayStore.ts` - State management
3. `/src/types/tradingDay.ts` - Type definitions
4. `/TRADING_DAY_SYSTEM.md` - System documentation
5. `/DAILY_CHECKLIST_IMPLEMENTATION.md` - Implementation guide
6. `/CHECKLIST_INTEGRATION.md` - This file

---

## Need Help?

- Read the comments in `/src/pages/DailyChecklistPage.tsx`
- Check `/DAILY_CHECKLIST_IMPLEMENTATION.md` for flow details
- Review `/TRADING_DAY_SYSTEM.md` for store usage

The entire system is frontend-only and works immediately with localStorage.
