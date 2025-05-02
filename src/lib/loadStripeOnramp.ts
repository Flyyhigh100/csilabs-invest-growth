
export const loadStripeOnrampScripts = () => {
  if (document.getElementById('stripe-js')) return; // already loaded
  const s1 = document.createElement('script');
  s1.src = 'https://js.stripe.com/v3/';
  s1.id  = 'stripe-js';
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.src = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
  s2.id  = 'stripe-onramp-js';
  document.head.appendChild(s2);
};
