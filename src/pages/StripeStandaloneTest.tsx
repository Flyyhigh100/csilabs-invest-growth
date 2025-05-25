
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const StripeStandaloneTest: React.FC = () => {
  useEffect(() => {
    // Load Stripe scripts
    const loadStripeScripts = async () => {
      const stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/';
      stripeScript.async = true;
      
      const cryptoScript = document.createElement('script');
      cryptoScript.src = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
      cryptoScript.async = true;
      
      document.body.appendChild(stripeScript);
      document.body.appendChild(cryptoScript);

      // Wait for the scripts to load
      await new Promise(resolve => {
        stripeScript.onload = () => {
          cryptoScript.onload = resolve;
        };
      });

      // Initialize the onramp once scripts are loaded
      initializeOnramp();
    };

    const initializeOnramp = () => {
      if (window.StripeOnramp) {
        const buyBtn = document.getElementById('buyBtn');
        if (buyBtn) {
          buyBtn.onclick = () => {
            const standaloneOnramp = window.StripeOnramp.Standalone({
              source_currency: 'usd',              // pay in dollars
              amount: { source_amount: '50' },     // $50
              destination_currency: 'usdc',        // want USDC
              destination_network: 'polygon'       // on the Polygon chain
            });
            
            const url = standaloneOnramp.getUrl();
            console.log('Redirecting to', url);
            window.location.href = url;
          };
        }
      } else {
        console.error('StripeOnramp is not available');
        setTimeout(initializeOnramp, 500); // Retry after a delay
      }
    };

    loadStripeScripts();

    // Cleanup function to remove scripts
    return () => {
      const scripts = document.querySelectorAll('script[src*="stripe.com"]');
      scripts.forEach(script => {
        document.body.removeChild(script);
      });
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Helmet>
        <title>Stripe Stand-alone Onramp Demo</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-4">Purchase crypto with Stripe</h1>
      <p className="mb-8 text-gray-600">This button will take you to Stripe's hosted onramp.</p>

      <button 
        id="buyBtn" 
        className="px-8 py-4 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Purchase $50 USDC on Polygon
      </button>
    </div>
  );
};

export default StripeStandaloneTest;
