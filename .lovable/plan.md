## Current state vs. requested image

The uploaded screenshot shows two changes the client wants on the homepage hero:

1. **Primary CTA** — replace the current `Purchase Now to Contribute →` button with a bold **"JOIN NOW"** button that has a small subtitle underneath: *"Do your Part … to Keep Killing Cancers …"*. The "View Research Documents" outline button next to it stays.
2. **Brand banner** — a new dark/gold ribbon reading **"1-Million STRONG | Digital HUB"** on top and **"KILLING CANCER FIGHT CLUB"** in a gold gradient bar underneath.

### What's already in place
- Promo box ("EASY as 1, 2, 3", Harvard, $1.00, $20M goal) — done.
- DEX → White Glove migration — done.
- Static $1.00 pricing — done.

### What's missing
- Hero CTA still reads "Purchase Now to Contribute" — no "JOIN NOW" + tagline styling.
- No "1-Million STRONG | Digital HUB / KILLING CANCER FIGHT CLUB" banner anywhere on the homepage.

## Plan

**1. `src/components/Hero/HeroContent.tsx`**
- Replace the primary `Button` with a stacked CTA:
  - Large bold **`JOIN NOW`** label (keep gradient blue→teal background, white text).
  - Smaller italic/light subtitle below: *"Do your Part … to Keep Killing Cancers …"*.
  - Wrap in `<Link to="/register">`. Keep the arrow icon.
- Leave the "View Research Documents" outline button unchanged.

**2. New banner component `src/components/Hero/FightClubBanner.tsx`**
- Dark (cbis-dark/black) rounded container.
- Top row: **"1-Million STRONG"** in gold serif + a thin vertical divider + **"Digital HUB"** in white sans bold.
- Bottom row: full-width gold gradient bar (amber-400 → amber-600) with **"KILLING CANCER FIGHT CLUB"** — "KILLING CANCER" in dark/black bold, "FIGHT CLUB" in white bold, matching the screenshot.
- Responsive: stacks cleanly at 393px viewport.

**3. `src/components/Hero/index.tsx`**
- Render `<FightClubBanner />` directly above the hero grid (full width inside the existing container) so it appears at the very top of the homepage hero, visible on both mobile and desktop.

**4. QA**
- Mobile (393px) + desktop: confirm JOIN NOW button shows tagline cleanly, banner renders with gold ribbon legible, no overflow.
- Click JOIN NOW → routes to `/register`.
- No regressions to TokenCard, PromotionalTextBox, or Research Documents button.

Approve and I'll implement.