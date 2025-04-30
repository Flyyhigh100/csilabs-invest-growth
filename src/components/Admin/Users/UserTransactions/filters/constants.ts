
// Constants for filter values
export const ALL_STATUSES = "all_statuses";
export const ALL_PAYMENT_METHODS = "all_payment_methods";

export const statusOptions = [
  { value: ALL_STATUSES, label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "canceled", label: "Canceled" }
];

export const paymentMethodOptions = [
  { value: ALL_PAYMENT_METHODS, label: "All Methods" },
  { value: "stripe", label: "Stripe" },
  { value: "coinpayments", label: "Crypto" },
  { value: "bank_transfer", label: "Bank Transfer" }
];
