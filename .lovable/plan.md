# Scale Fight Club Tag to Match Benefits Box Width

On `/signup`, the Fight Club tag (bottom-right) is currently capped at `max-w-sm`. The client wants it to span the full width of the blue "RegistrationBenefits" box above it on desktop.

## Change
In `src/pages/Auth/Register.tsx`, replace the wrapper around `<FightClubTagBar />`:

- Remove the `flex justify-end` + `max-w-sm` constraint.
- Render the tag full-width inside the right column so it matches the width of `RegistrationBenefits` directly above it.

```tsx
<div className="w-full">
  <FightClubTagBar />
</div>
```

No other files affected.
