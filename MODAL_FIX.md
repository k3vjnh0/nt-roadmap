# 🔧 Modal UI Fix - Report Incident & Filter Panel

## Problem
Both modals (Report Incident and Filter Panel) appeared to freeze the app when opened.

## Root Cause
1. **Low z-index** (`z-50`) - Not high enough to be on top of all elements
2. **No click-outside handling** - Clicking the backdrop didn't close the modal
3. **Event propagation** - Clicks inside modal were also triggering backdrop clicks

## Solution Applied

### 1. Increased z-index
Changed from `z-50` to `z-[9999]` to ensure modals are always on top

### 2. Added Click-Outside to Close
```tsx
// Backdrop closes modal when clicked
<div onClick={toggleModal}>
  // Modal content prevents close when clicked
  <div onClick={(e) => e.stopPropagation()}>
    ...content...
  </div>
</div>
```

### 3. Event Propagation Control
Using `e.stopPropagation()` to prevent clicks inside the modal from closing it

## Files Changed
- ✅ `packages/web/src/components/FilterPanel.tsx`
- ✅ `packages/web/src/components/ReportForm.tsx`

## Test Instructions
1. Start app: `npm run dev`
2. Open app: http://localhost:3000
3. Click **"Filters"** button
   - ✅ Modal should appear on top
   - ✅ Background should be dimmed
   - ✅ Click outside to close
   - ✅ Click inside should NOT close
4. Click **"Report Incident"** button
   - ✅ Modal should appear on top
   - ✅ Click outside to close
   - ✅ Form should be interactive

## Result
✅ Modals now display properly without freezing
✅ Click outside to close works
✅ Click inside modal works normally
✅ High z-index ensures visibility
