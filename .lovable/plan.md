## Goal
Replace the gradient "Purchase Now to Contribute →" button at the bottom of the `InvestmentModel` section (the last CTA on the homepage before the footer) with the same JOIN NOW image button used at the top of the hero — matching it aesthetically.

## Changes

### 1. Save the uploaded image
Copy `user-uploads://image-70.png` → `src/assets/hero/join-now-button.png` (overwrite). It's the same asset used by `JoinNowImageButton`, so reusing keeps a single source of truth.

### 2. Swap the CTA in `src/components/InvestmentModel.tsx`
Replace lines 74–80:
```tsx
<div className="pt-4">
  <Button asChild size="lg" className="...">
    <Link to="/signup">Purchase Now to Contribute <ArrowRight ... /></Link>
  </Button>
</div>
```
with:
```tsx
<div className="pt-4">
  <JoinNowImageButton className="w-full sm:w-auto sm:max-w-[260px]" />
</div>
```
Add `import JoinNowImageButton from '@/components/Hero/JoinNowImageButton';` and remove the now-unused `ArrowRight` / `Button` imports if nothing else in the file uses them.

`JoinNowImageButton` already routes to `/signup`, so the destination stays correct.

## Verification
- Reload `/`, scroll to the Investment Model section.
- Confirm the last button now visually matches the hero JOIN NOW button and clicking it lands on `/signup`.