## Goal

Three functional changes plus promotional refresh from the new PPTX/PDF, with zero changes to backend/edge functions. This eliminates the 503 `crypto-price-proxy` errors as a side benefit (frontend stops calling it).

---

## 1. Lock token price to a static $1.00 USD per coin

Single source of truth: new file `src/services/api/staticPrice.ts` exporting `STATIC_TOKEN_PRICE = 1.00`.

Wire it through:
- **`src/context/TokenPriceContext.tsx`** — replace `fetchPrice` with synchronous setter that returns `{ price: 1.00, source: 'static' }`. Drop the polling interval and countdown.
- **`src/services/api/currentPriceService.ts`** — short-circuit `fetchCurrentTokenPrice` to return `{ price: 1.00, source: 'static' }`. No more on-chain / Defined.fi / DexScreener / proxy calls.
- **`src/services/api/priceConversionService.ts`** — use `STATIC_TOKEN_PRICE` directly (100 USD = 100 CSL exactly, applies to dashboard purchase math too).
- **`src/hooks/token/useCurrentPrice.ts`** and **`src/hooks/useDynamicTokenPrice.ts`** — return constant `1.00`, no React Query network call.
- **`src/services/tokenDataService.ts` / `src/hooks/token/usePriceHistory.ts`** — return `[]` so no Graph API calls fire.
- Add `'static'` to the `dataSource` union type in `TokenPriceContext`.

Display update everywhere price is shown publicly (Hero `TokenCard`, `TokenPriceHeader`, `TokenCalculator`, `BuyTokensTab`, `PaymentStatus`, `CurrentPriceCard`):
- Render `$1.00 USD - Per Coin`
- Remove "last updated", TWAP/source label, refresh button, and countdown timer
- Per-coin price still uses `formatCurrencyPrecise` (project memory) — string label rendered as "$1.00 USD"

## 2. Remove the price chart

- **`src/pages/Admin/TokenPricing.tsx`** — remove the `<TokenPriceChart>` card from the Overview grid; keep `CurrentPriceCard` and `PriceDebugger`. Diagnostics tab stays for admins.
- **`src/components/Hero/TokenCharts.tsx`** — verify unused; delete if no other imports. (Hero already does not render it.)
- **`src/components/TokenPricing/DexToolsChart.tsx`** and **`src/components/Admin/TokenPricing/TokenPriceChart.tsx`** — leave files in place (unreferenced) so we can re-enable later without re-implementing.

## 3. Replace DEX option with "White Glove Service" box

- New file **`src/components/Dashboard/TokenPurchase/WhiteGloveServiceOption.tsx`** modeled on the existing `DexPurchaseOption` layout:
  - Heading: **White Glove Service**
  - Subheading: "$1,000.00+ Contributions — VIP Status"
  - Body copy from PDF page 8: concierge onboarding, bank wire instructions, direct support to fund cancer-killing drug development.
  - CTA buttons: **"Request White Glove Service"** → `mailto:` to the project's existing contact email (will pull the address already used in `Footer.tsx` / `ContactUs.tsx`); secondary **"Bank Wire Instructions"** linking to the existing wire-instructions location (or a placeholder if none exists, flagged for the client).
  - Promo image from the PPTX media kit (copied into `src/assets/promo/`).
- **`src/components/Dashboard/TokenPurchase/PaymentOptions.tsx`** — swap `<DexPurchaseOption />` for `<WhiteGloveServiceOption />`. Update the "Understanding Your Purchase Options" footer: replace the DEX paragraph with a White Glove paragraph.
- Delete `DexPurchaseOption.tsx` (no other consumers found).

## 4. Promotional images & wording refresh from the PPTX/PDF

Copy parsed images from `parsed-documents://…/page_*_image_*_v2.jpg` into `src/assets/promo/` and wire them in:

- **`src/components/Hero/PromotionalTextBox.tsx`** — updated "Celebrating 1-Million Strong / Congratulations New Fight Club Members" graphic + copy.
- **`src/components/Hero/index.tsx`** left-column hero image — swap to the new one-pager from the PPTX if provided.
- **Module/perk tile boxes** (Membership, Crypto & Perks, Awards & Grants, Contests & VIPs, Contribution Perks, TV Shows/Events, Scholarships, Jobs/Perks) — render the matching tile images from the PPTX. Will identify the exact component when implementing (likely lives in Hero or `TokenDetails`).
- **VIP Event media-kit thumbnails** — small grid added beneath the existing Dr. Ray image on the Hero secondary section.
- Wording updates from the PDF:
  - "It's TIME for Low-Cost Cancer Killing Drugs"
  - "$3,900.00 USD - Now / $20,000,000 USD Killing Cancer Goal"
  - "EVERYONE has been AFFECTED by Cancers!"
  - 1-2-3 steps: REGISTER → CONNECT → CONTRIBUTE
  - HARVARD Award Winning callouts (Stage 4 Lung Cancer, Skin Cancer, Kaposi Sarcoma, Stage 4 Breast Cancer)
  - Applied across `HeroContent`, `TokenDetails`, `InvestmentModel`, `ResearchHighlights` as appropriate.

---

## Decisions locked in (per your "let's get this done" go-ahead)

1. Admin chart card → **removed entirely** from Overview tab; Diagnostics tab preserved.
2. White Glove CTA → **mailto** to the project's existing contact address (will reuse whatever Footer/ContactUs already uses; flagged if I can't find one).
3. Static $1.00 → **applied everywhere**, including dashboard purchase calculations.

## Out of scope

- Edge functions (`crypto-price-proxy`, etc.) — left untouched; safe because nothing calls them.
- Polygon contract address, token symbol, total supply — unchanged.
- Auth, KYC, CoinPayments, Stripe flows — unchanged.

## Risk / verification

- Token purchase math depends on `currentPrice`. After lock-in, $X USD always equals X CSL. Will spot-check `BuyTokensTab`, `TokenCalculator`, CoinPayments handler, and Stripe onramp handler to confirm none divide-by-zero or break when `dataSource === 'static'`.
- React Query keys (`currentTokenPrice`, `tokenPriceHistory`) keep working — they just resolve instantly with constants.
- Visual QA of Hero, BuyTokens, and Admin TokenPricing pages after the change.

Ready to implement on approval.
