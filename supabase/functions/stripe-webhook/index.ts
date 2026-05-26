import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const metadata = session.metadata;

      if (!metadata || !metadata.userId || !metadata.cardId) {
        throw new Error("Missing required metadata: userId or cardId");
      }

      const { userId, cardId } = metadata;

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Call the RPC function with corrected parameter name
      const { data, error } = await supabase.rpc("fulfill_purchase", {
        p_user_id: userId,
        p_card_id: cardId,
        p_stripe_payment_id: session.payment_intent
      });

      if (error || !data?.success) {
        throw new Error(`Fulfillment failed: ${error?.message || data?.error}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`[Webhook Error] ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
