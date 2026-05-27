# Fix Stripe Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix parameter mismatch, add safe metadata extraction, and improve error checking in the Stripe webhook Edge Function.

**Architecture:** Update the Deno-based Edge Function to use the correct RPC parameter name and add robust validation for environment variables and webhook metadata.

**Tech Stack:** Deno, Stripe SDK, Supabase RPC.

---

### Task 1: Update Stripe Webhook Function

**Files:**
- Modify: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Implement fixes in `supabase/functions/stripe-webhook/index.ts`**
  - Fix the RPC parameter name from `p_payment_id` to `p_stripe_payment_id`.
  - Add explicit checks for `signature` and `webhookSecret`.
  - Add safe metadata extraction with existence checks.

```typescript
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
      const session = event.data.object as Stripe.Checkout.Session;
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
      const { error } = await supabase.rpc("fulfill_purchase", {
        p_user_id: userId,
        p_card_id: cardId,
        p_stripe_payment_id: session.payment_intent
      });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`[Webhook Error] ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
```

- [ ] **Step 2: Commit changes**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit --amend --no-edit
```
