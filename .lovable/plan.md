# Fix JOIN NOW 404

The signup route in `src/App.tsx` is `/signup`, but several hero CTAs link to `/register`, causing a 404.

## Changes

Update three files, replacing `to="/register"` with `to="/signup"`:

1. `src/components/Hero/JoinNowImageButton.tsx` — line 7
2. `src/components/Hero/FightClubHeroPanel.tsx` — line 17 (main hero image link)
3. `src/components/Hero/CelebratingBadge.tsx` — line 7

No other code, layout, or styling changes.

## Verification

After applying, clicking JOIN NOW (button, hero image, or celebrating badge) should navigate to the existing `/signup` page instead of the 404.
