
# Equalize Contribution Cards

In `src/components/Dashboard/TokenPurchase/PurchasePathSelector.tsx`, the Direct Charitable Contribution card passes `highlight={true}`, which renders a thicker primary-colored border that makes it look pre-selected versus the White Glove Service card.

## Change

- Remove `highlight={true}` from the `Direct Charitable Contribution` `<PurchaseMethodCard>` (line 47).

Result: both cards render with the same neutral border, shadow, and rounded corners. Each retains its own identity through its badge (`Register for your Free Account` vs `VIP`) and its CTA button color (blue/teal gradient vs amber gradient), but neither appears as the default recommendation.

No other files affected.
