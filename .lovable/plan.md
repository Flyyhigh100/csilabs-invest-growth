# Register Page Visual Updates

Update `src/pages/Auth/Register.tsx` to match the client's mockup by adding two existing brand images and reusing the home page tag component.

## Changes

### 1. Save uploaded asset
- Copy `user-uploads://image-58.png` → `src/assets/hero/register-hero-banner.png` (the "1-Million STRONG | Digital HUB / KILLING CANCER FIGHT CLUB" wide banner with gold accents, current spot price, goals list, etc.)
- Upscale/sharpen via Lovable AI image edit (Nano banana pro) to roughly 2x current resolution so it renders crisply at full container width.

### 2. Top banner (above the title)
In `src/pages/Auth/Register.tsx`, immediately after the existing top header row (logo + Back to Home) and before the `pt-12 pb-20 container-custom` block, insert a full-width banner:
- Wrapped in `container-custom` with rounded corners, subtle gold border, and shadow (matches `CelebratingBadge`/`FightClubTagBar` styling).
- Renders the upscaled `register-hero-banner.png` as a responsive `<img>` (`w-full h-auto`).
- Sits just under the navigation, above the "1-Million Strong Killing Cancers Fight Club! Join the FIGHT…" title.

### 3. Bottom-right Fight Club tag
Reuse the existing `FightClubTagBar` component (same one used on the home page, renders `src/assets/hero/fight-club-tag.png`).
- Place it inside the bottom of the right-hand column (under `RegistrationBenefits`) within a `flex justify-end` wrapper, constrained to ~`max-w-sm` so it reads as a compact tag in the bottom-right corner of the page (matching mockup #2).

## Technical Details
- Files modified: `src/pages/Auth/Register.tsx`
- Files added: `src/assets/hero/register-hero-banner.png`
- Components reused: `FightClubTagBar`
- No route, schema, or auth logic changes
- Image upscaling done once at build/asset-prep time via the Lovable AI gateway (`google/gemini-3-pro-image-preview`), result saved to disk — no runtime API calls
