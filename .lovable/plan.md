## Change
Remove only line 57 in `src/components/Hero/TokenCard.tsx`:

```tsx
<p className="text-base font-semibold text-amber-300 mt-2">$3,900.00 USD — Now</p>
```

Leave the `$20,000,000 USD` headline and the `Killing Cancer Goal` subtitle untouched.

## Verification
Reload `/` and confirm the dark goal banner now shows only the goal amount and label.