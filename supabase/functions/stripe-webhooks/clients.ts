
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Initialize Supabase client
export const createSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Initialize Stripe with API key
export const createStripeClient = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
};

// Initialize both clients at once
export const createClients = () => {
  const stripe = createStripeClient();
  const supabaseClient = createSupabaseClient();
  return { stripe, supabaseClient };
};

// Verify Stripe webhook signature - ASYNC version
export const verifyStripeSignatureAsync = async (body: string, signature: string) => {
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
  }
  
  const stripe = createStripeClient();
  // Use constructEventAsync instead of constructEvent
  return await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
};
