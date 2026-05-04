## Audit vs original plan + client feedback

| Plan item | Status |
|---|---|
| 1. Static $1.00 token price wired everywhere | ✅ Done (`staticPrice.ts`, contexts, services, hooks) |
| 2. Remove price chart from Admin Overview | ✅ Done (`TokenPriceChart` / `DexToolsChart` files retained but unreferenced) |
| 3a. Replace DEX with White Glove in `PaymentOptions.tsx` (BuyTokens flow) | ✅ Done |
| 3b. Replace DEX with White Glove in `PurchasePathSelector.tsx` (Payments page entry) | ❌ **Missed** — still shows "Decentralized Exchange (DEX)" card with Polygon/Solana DEX buttons |
| 4. Promo refresh: Hero copy, $1.00, $20M Killing Cancer Goal, Harvard award, 1-2-3 steps, 1-Million Strong | ✅ Done in `TokenCard.tsx`, `PromotionalTextBox.tsx`, `HeroContent.tsx` |
| Edge functions disabled (CoinPayments polling) | ✅ Done (no more 503/500s) |

**Only gap:** `PurchasePathSelector` is the first thing users see on `/dashboard/payments`, and it still routes to Uniswap/Raydium. This contradicts the client's "DEX → White Glove" direction.

## Fix

**1. `src/components/Dashboard/TokenPurchase/PurchasePathSelector.tsx`**
- Remove `CSI_TOKEN_POLYGON_URL`, `CSI_TOKEN_SOLANA_URL`, `handleSelectPolygonDex`, `handleSelectSolanaDex`, and the `onSelectDex` prop.
- Replace the second `PurchaseMethodCard` ("Decentralized Exchange (DEX)") with a White Glove card:
  - Title: **White Glove Service**
  - Description: "VIP concierge for $1,000+ contributions. Bank wire instructions and dedicated onboarding from the CSi Labs team."
  - Icon: `Crown` (lucide)
  - Badge: "VIP" / `secondary`
  - Single CTA button: **"Request White Glove Service"** → `mailto:raymond.dabney@cannabisscience.com` (same address used in the existing `WhiteGloveServiceOption`)
- Update the "Why choose Direct Charitable Contribution?" footer bullets to compare Direct vs White Glove (drop the DEX-specific language).

**2. `src/components/Dashboard/Payments/PaymentSections.tsx`**
- Remove the `onSelectDex` prop and the related `CSI_TOKEN_UNISWAP_URL` import/log lines that become dead code.

**3. QA**
- Visual check on `/dashboard/payments` (mobile 393px + desktop): confirm two cards render — Direct Charitable Contribution + White Glove Service. No DEX/Uniswap/Raydium text or links remain anywhere in the purchase flow.
- Spot-check Hero, BuyTokens, Admin TokenPricing pages still render correctly (no regressions from the previous round).

## Out of scope

- Backend / edge functions — already disabled, untouched.
- `BuyTokensTab` / `PaymentOptions.tsx` — already correct.
- Unreferenced chart files (`TokenPriceChart.tsx`, `DexToolsChart.tsx`) — left in place per original plan for future re-enable.

Approve and I'll implement.