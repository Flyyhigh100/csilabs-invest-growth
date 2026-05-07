## Goal
Reframe the hero banner image on the home page so it sits roughly 20% lower in its container, giving the gentleman's face more prominence at the top of the page.

## Change
- File: `src/components/Hero/FightClubHeroPanel.tsx`
- The `<img>` currently uses `w-full h-auto object-contain block`, which renders the image at its natural aspect ratio (no cropping, no vertical offset possible).
- To shift the image down ~20%, switch to a fixed-aspect container with `object-cover` and apply `object-position: center 20%` (Tailwind: `object-[center_20%]`). This crops the bottom slightly and reveals more of the upper portion, effectively shifting the visible content downward relative to the frame.
- Keep the rounded corners, border, and link wrapper unchanged.

## Verification
- Reload `/` in the preview and confirm the gentleman's face is more centered/visible in the hero frame.
- Check responsive widths (mobile + desktop) to make sure no important content (laurel, "Congratulations" banner) gets clipped awkwardly. If it does, fall back to a smaller offset (e.g. `center 30%`).

## Notes
- No other components, copy, or assets change.
- If the result looks off, the single knob to tune is the percentage in `object-[center_XX%]`.