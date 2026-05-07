## Goal
The "$3,900.00 USD – Now" text is **baked into the hero image file** (`src/assets/hero/fight-club-hero.png`), not rendered by the page. It needs to be edited out of the image itself.

## Change
Use the `imagegen--edit_image` tool (Nano Banana) to remove only the "$3,900.00 USD - Now" line from inside the dark "Killing Cancer Goal" panel on the right side of the image. Everything else — the "$20,000,000.00 USD" headline, the "Killing Cancer Goal" subtitle, the panel border, and the rest of the composition — stays exactly as it is.

- Input: `src/assets/hero/fight-club-hero.png`
- Output: overwrite same path so all existing imports continue to work
- Prompt focuses on a clean removal, matching the surrounding dark panel background, no relayout of other text.

## Verification
- Reload `/` and visually confirm the dark panel now shows only the $20M goal + "Killing Cancer Goal", with the "$3,900.00 USD – Now" line cleanly removed and no artifacts.
- If the result has artifacts or accidentally alters other text, re-run with a tighter prompt or revert.