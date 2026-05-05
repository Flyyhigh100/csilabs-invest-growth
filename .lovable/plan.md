
# Dashboard Buy Tokens Page Refresh

Bring the dashboard "Buy Tokens" view in line with the client's mockup (image 2) by replacing the gradient banner with the upscaled Fight Club hero (image 3) and giving the White Glove Service card a more prominent, on-brand look.

## 1. New banner image asset

- Copy `user-uploads://image-62.png` into `src/assets/hero/` as a working source.
- Use the AI image gateway (Nano banana pro) to upscale & sharpen it into a crisp wide banner: `src/assets/hero/dashboard-fight-club-banner.png`. Preserve the existing artwork (gold seal, Welcome & Explore, Acquire / INPUT / TRACK rows, "1-Million STRONG | Digital HUB / KILLING CANCER FIGHT CLUB" lockup) — do not regenerate the design, just upscale.

## 2. Replace the Buy Tokens banner

File: `src/components/Dashboard/Layout.tsx` (lines ~79–114, the `title === "Buy Tokens"` branch).

- Remove the blue/purple/teal gradient block, sparkles, numbered list, and welcome paragraph.
- Render the new banner image full-width inside a rounded container that matches the rest of the dashboard styling:

```tsx
<div className="rounded-2xl overflow-hidden shadow-elevation border border-amber-500/30">
  <img
    src={dashboardFightClubBanner}
    alt="1-Million Strong Killing Cancer Fight Club — Digital HUB"
    className="w-full h-auto block"
  />
</div>
```

- Keep the conditional so other dashboard pages still show the plain `{title}` heading.

## 3. White Glove Service restyle

File: `src/components/Dashboard/TokenPurchase/WhiteGloveServiceOption.tsx`.

Match the client's emphasis (image 2 right side: bold "ADD White Glove Service", $1,000+ contributions, VIP Status, Bank Wire Instructions):

- Wrap the component in a premium card: gradient amber/gold background (`bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200`), thicker `border-2 border-amber-500`, `rounded-2xl`, shadow.
- Header row: large `Crown` icon + `White Glove Service` title, with a gold "VIP" pill badge aligned right.
- Replace the current intro paragraph with three stacked highlight rows (icon + label):
  - `$1,000+ Contributions`
  - `VIP Status`
  - `Bank Wire Instructions`
- Keep the existing "What you receive" list but tighten spacing and use amber accents for bullets.
- Promote the primary CTA: full-width amber gradient `Request White Glove Service` button (keep existing mailto). Demote `Bank Wire Instructions` to a secondary outline button below.
- Keep the existing `CONTACT_EMAIL` and mailto behavior unchanged.

No changes needed to `WhiteGloveServiceOption`'s consumers — the public API stays the same.

## Files touched

- Add: `src/assets/hero/dashboard-fight-club-banner.png`
- Edit: `src/components/Dashboard/Layout.tsx`
- Edit: `src/components/Dashboard/TokenPurchase/WhiteGloveServiceOption.tsx`
