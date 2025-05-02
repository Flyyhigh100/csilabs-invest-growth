
interface StripeOnrampOptions {
  source_currency: string;
  amount: { source_amount: string };
  destination_currency: string;
  destination_network: string;
}

interface StripeStandalone {
  getUrl: () => string;
}

interface StripeOnramp {
  Standalone: (options: StripeOnrampOptions) => StripeStandalone;
}

declare global {
  interface Window {
    StripeOnramp: StripeOnramp;
  }
}

export {};
