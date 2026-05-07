## Change
In `src/components/Hero/TokenCard.tsx` line 66, add an `object-position` to the circular avatar so the face is fully visible. The image currently crops at the suit/tie because `object-cover` defaults to center.

```tsx
className="w-14 h-14 rounded-full object-cover object-[center_15%] border-2 border-amber-400 flex-shrink-0"
```

This pulls the visible portion ~15% higher in the frame, revealing the full face inside the circle. No other elements change.

## Verification
Reload `/` and confirm the avatar in the Harvard Award callout shows the full face.