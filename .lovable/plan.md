## Fix the TWAP price fetch error

### Diagnosis

The 503 "Service is temporarily unavailable" was a transient Supabase Edge Runtime cold-start hiccup — the `crypto-price-proxy` function logs show every actual request returning success (`[PRICE PROXY] Success for rpc/graph`). No edge-function fix is needed.

The **real, repeating bug** in your console is:

```
TypeError: token0Result.slice is not a function
  at fetchOnchainTwap (src/services/api/twapPriceService.ts:40)
```

It retries 4 times every price refresh, then falls back to V3 spot price. Cause: `makeRpcCall` in `src/services/api/proxyService.ts` returns the **full JSON-RPC envelope** (`{ jsonrpc, id, result: '0x...' }`) — not the hex string. The TWAP code calls `.slice(-40)` directly on that object, which throws.

### Fix

**File:** `src/services/api/twapPriceService.ts`

In `fetchOnchainTwap()`, extract `.result` from each `makeRpcCall` response before using it as a hex string. Three call sites are affected:

1. **Lines 42–60** — `token0()` and `token1()` calls: rename returned values to `token0Response` / `token1Response`, then derive `token0Result` / `token1Result` as `response.result` (with a string fallback for safety) and validate they exist before slicing.

2. **Lines 87–99** — `observe()` call: same pattern — read `.result` off `observeResponse` before passing to `ethers.utils.defaultAbiCoder.decode`.

Add a clear thrown error if `.result` is missing so future regressions surface immediately instead of through the cryptic `.slice is not a function`.

### Result

- TWAP fetch succeeds on the first try, no more retry loop.
- The on-chain TWAP price source becomes the active one again instead of always falling back to V3 spot.
- Console noise (4 warnings + 1 error per price refresh) is gone.
- Edge function is untouched — it's already healthy.