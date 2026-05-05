## Hero Section Redesign — Step 1 of 9

The client provided a composite mockup (`Hero_Section.png`) showing exactly how the top of the homepage should look. This plan covers **only the hero section**. Subsequent pages of the PDF will be addressed in follow-up steps.

### What the mockup shows
A single dark, gold-trimmed hero panel containing:
- "CELEBRATING 1-Million STRONG KILLING CANCERS FOUNDATION" with laurels and "Congratulations! New Fight Club Members!" ribbon
- Photo of Dr. Raymond Dabney with Harvard award (top right)
- "YOUR Contributions and Memberships $$$'s" bullet list with gold "GO DIRECTLY" callouts
- "HARVARD Award Winning — CANCER KILLING SUCCESS — Stage 4 Lung Cancer, Dead" sidebar with award icon
- "More Cancer Killing Success... Skin Cancer, Kaposi Sarcoma, Stage 4 Breast Cancer, Dead"
- "EVERYONE has been AFFECTED by Cancers!"
- "1-Million STRONG | Digital HUB" / "KILLING CANCER FIGHT CLUB" gold ribbon
- Gold "Seal of Approval" medallion listing perks (Membership, Crypto & Perks, Awards & Grants, Contests & VIP's, Contribution Perks, TV Shows, Events, Scholarships, Jobs, Perks)
- "It's TIME for Low-Cost Cancer Killing Drugs"
- Two stat cards: **CSi-Labs (CSL) Current Spot Price $1.00 USD - Per Coin** and **$20,000,000.00 USD Killing Cancer Goal / $3,900.00 USD - Now**
- "It's as EASY as 1, 2, 3..." — REGISTER / CONNECT / CONTRIBUTE

### Approach
Use the uploaded `Hero_Section.png` as the primary hero artwork (the simplest path to "look exactly like the image") and overlay the live, dynamic pieces (price, JOIN NOW CTA) so the page stays functional.

### Changes
1. **Add the artwork**
   - Copy `user-uploads://Hero_Section.png` → `src/assets/hero/fight-club-hero.png`.

2. **`src/components/Hero/index.tsx`**
   - Replace the current two-column grid (cancer-treatment image + token card + promo box + Dr. Ray photo) with a single full-width hero block.
   - Render `FightClubBanner` (already exists) at the very top.
   - Below it, render the new `FightClubHeroPanel` (see #3).
   - Keep `VideoSection` and `HeroContent` (with JOIN NOW button) underneath — the JOIN NOW CTA from the mockup will appear directly below the artwork.
   - Keep the live `TokenCard` further down so dynamic price + chart data is still available, but de-emphasized.

3. **New `src/components/Hero/FightClubHeroPanel.tsx`**
   - Renders the imported `fight-club-hero.png` as a responsive image (`w-full h-auto rounded-2xl shadow-elevation border border-amber-500/30`).
   - Wrapped in a `Link to="/register"` so the entire panel is clickable (matches the "JOIN NOW" intent).
   - Below the image: a live overlay strip with the **current spot price** pulled from `useTokenData()` so the "$1.00 USD - Per Coin" stat reflects real data, and a "JOIN NOW — Do your Part… to Keep Killing Cancers…" CTA button (reuses styling from `HeroContent`).
   - Alt text: "1-Million Strong Killing Cancer Fight Club — Harvard Award Winning Cancer Treatments".

4. **Retire / relocate**
   - Remove `PromotionalTextBox` from the hero (its content is now baked into the artwork). Leave the file in place for now in case the client wants it elsewhere.
   - Remove the standalone Dr. Ray photo + cancer-treatment PDF image from the hero grid (also represented in the artwork). Keep the PDF link accessible via "View Research Documents" button already in `HeroContent`.

### Technical notes
- Image will be imported via ES module: `import heroImg from '@/assets/hero/fight-club-hero.png'` for proper Vite bundling.
- Responsive: image scales full-width on mobile; on `md+` it's capped at container width with the JOIN NOW CTA stacked beneath.
- Live price still flows through `useTokenData` → displayed in the overlay strip and unchanged in the existing `TokenCard` further down the page.
- No backend, no schema, no auth changes.

### Out of scope (future steps)
Pages 2–9 of the PDF (Journey/About, Membership Privileges, Roadmap, Token Details, Fight Now, Contribution flow, Welcome/Explore, Login) will be tackled one-by-one in follow-up requests.
