## Change
Remove the `pt-[20%]` top padding from the hero panel container in `src/components/Hero/FightClubHeroPanel.tsx` (line 8). That padding was added earlier to push the image down and is the source of the gap between the navigation bar and the hero image.

```tsx
<div className="w-full">
```

## Verification
Reload `/` and confirm the hero image sits flush below the nav bar.