# Update White Glove Service Threshold

## Overview
Change the White Glove Service minimum contribution threshold from **$1,000** to **$10,000** across all user-facing content and email templates.

## Files to Update

1. **`src/components/Dashboard/TokenPurchase/WhiteGloveServiceOption.tsx`**
   - Update highlight label from `$1,000+ Contributions` to `$10,000+ Contributions`
   - Update mailto link body text from `$1,000` to `$10,000`

2. **`src/components/Dashboard/TokenPurchase/PurchasePathSelector.tsx`**
   - Update description from `$1,000+ contributions` to `$10,000+ contributions`
   - Update mailto link body text from `$1,000` to `$10,000`

3. **`src/components/Dashboard/TokenPurchase/PaymentOptions.tsx`**
   - Update White Glove Service paragraph from `$1,000+` to `$10,000+`

## Verification
- All user-facing references to the White Glove minimum will display `$10,000+`
- All mailto links for VIP service requests will reference `$10,000` in the email body