## Remove the DexTools Chart from the Homepage Token Card

The chart shown in your screenshot is the DexTools embed inside the `$CSi-EDP/Labs` card on the homepage hero. It's rendered by `src/components/Hero/TokenCard.tsx` via the `<DexToolsChart />` component.

### Change

**File:** `src/components/Hero/TokenCard.tsx`

Remove the chart container block and its import:

1. Remove the import:
```tsx
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';
```

2. Remove this block (lines 41–44):
```tsx
{/* Chart container with responsive height and padding */}
<div className="h-auto mb-8 sm:mb-10">
  <DexToolsChart />
</div>
```

3. Tidy spacing — since the chart is gone, drop the now-redundant top margin on the `TokenInfo` wrapper so the card stays balanced:
```tsx
<div className="mt-2">
  <TokenInfo tokenInfo={tokenInfo} isLoading={isLoading} />
</div>
```

### Result

The `$CSi-EDP/Labs` card on the homepage will keep its title and the token info section below, but the embedded DexTools price chart (and the "View on DexTools" button overlay) will be cleanly removed. No other pages are affected — the admin Token Pricing page still uses `DexToolsChart` independently.