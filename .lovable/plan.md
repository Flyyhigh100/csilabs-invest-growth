## Goal
Remove the "$3,900.00 USD - Now" green text line from the signup page hero banner image, keeping everything else identical.

## Change
- Target file: `src/assets/hero/register-hero-banner.png` (used by `src/pages/Auth/Register.tsx`)
- Use `imagegen--edit_image` (Nano Banana) with a tightly-scoped prompt: erase only the green "$3,900.00 USD - Now" line inside the dark "Killing Cancer Goal" panel and fill with the same black background. Preserve the "$20,000,000.00 USD" headline, "Killing Cancer Goal" subtitle, gold border, CSi-Labs panel, seal, "EASY as 1, 2, 3" steps, and all other text/layout exactly as-is.
- Overwrite same path so the import keeps working.

## Verification
Reload `/signup` and confirm the panel shows only the $20M goal + subtitle, with no artifacts where the line used to be.