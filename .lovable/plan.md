## Goal
Replace the current low-res hero image (`src/assets/hero/fight-club-hero.png`, 474×598) with a higher-resolution version so it stays sharp on desktop. Layout, components, and copy stay exactly the same.

## Steps

1. **Generate a high-res version** using the Lovable AI image gateway (Nano banana pro, `google/gemini-3-pro-image-preview`) in edit mode:
   - Input: existing `src/assets/hero/fight-club-hero.png`
   - Instruction: "Recreate this exact image at high resolution (~1920px wide). Preserve every element, color, text, layout, and composition precisely — Dr. Ray photo, gold ribbon, 'KILLING CANCER FIGHT CLUB' wordmark, Harvard award badge, all subtitles. Sharpen text and edges. Do not redesign."
   - Save output to `src/assets/hero/fight-club-hero.png` (overwrite).

2. **QA the result** by viewing the new file dimensions and a screenshot to confirm:
   - Resolution is significantly higher (target ≥1600px wide).
   - All text is legible and unchanged.
   - No layout/content drift.
   - If text comes back garbled, fall back to a pure pixel upscale (2×) instead and keep the original art untouched.

3. **No code changes required** — `FightClubHeroPanel.tsx` already imports the asset by path; Vite will pick up the new file automatically.

## Risk / fallback
AI re-rendering can occasionally alter small text. If QA shows any wording change, I'll discard the AI output and use a deterministic 2×–3× upscale (Pillow LANCZOS) instead, which keeps pixels faithful but is only modestly sharper.
