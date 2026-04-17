# Premarket Calibration Feature

This feature folder contains all components and logic related to the premarket calibration system for traders.

## Structure

```
premarket/
├── PremarketPage.tsx          # Main page component
├── components/
│   ├── ChecklistItem.tsx      # Individual checklist item component
│   └── RulesPromptModal.tsx   # Modal for rules adherence selection
├── index.ts                   # Clean exports
└── README.md                  # This file
```

## Components

### PremarketPage
The main page component that handles:
- Pre-Market Analysis completion
- Post-Market Review completion
- Discipline Tracker (Close Day)
- Status display (Green/Red/Neutral)

### ChecklistItem
Reusable component for displaying checklist items with:
- Completion status
- Action buttons
- Disabled/locked states
- Visual feedback

### RulesPromptModal
Modal component for selecting rules adherence:
- Yes (followed all rules)
- No (broke at least one rule)
- Neutral (did not trade)

## Dependencies

- `useTradingDayStore` - Zustand store for TradingDay state management
- `framer-motion` - Animations
- `lucide-react` - Icons

## Usage

```tsx
import { PremarketPage } from '@/features/premarket';

// In your route:
<Route path="/checklist" element={<PremarketPage />} />
```

## Notes

- All discipline logic is handled by the `useTradingDayStore`
- This feature is self-contained and does not pollute the main app structure
- Components are designed to be reusable and testable
