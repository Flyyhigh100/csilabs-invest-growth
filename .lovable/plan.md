## Goal
1. Replace the existing "JOIN NOW" button image on the homepage with the newly uploaded image.
2. Fix all `/register` links across the site so they point to `/signup` (the only registered route — `/register` is currently 404).

## Changes

### 1. Replace button image
Copy `user-uploads://image-69.png` to `src/assets/hero/join-now-button.png` (overwrite). Existing component `src/components/Hero/JoinNowImageButton.tsx` already imports this path and already links to `/signup`, so no code change needed there.

### 2. Fix `/register` links → `/signup`
Found 4 stale `/register` links (router only registers `/signup`):
- `src/components/Hero/PromotionalTextBox.tsx` (line 8)
- `src/pages/TokenInfo.tsx` (lines 123, 228, 242)
- `src/components/InvestmentModel.tsx` (line 76)

Update each `to="/register"` → `to="/signup"`. Pure find-and-replace, no other changes.

## Verification
- Reload `/`, click the new JOIN NOW button → lands on `/signup` (not 404).
- Click "Join Now — Register Free" promo box and the InvestmentModel / TokenInfo CTAs → all land on `/signup`.