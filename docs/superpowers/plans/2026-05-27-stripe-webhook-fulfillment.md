# Stripe Webhook Fulfillment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fulfill class passes atomically upon successful payment via Stripe Webhook.

**Architecture:** A Supabase Edge Function listens for Stripe `checkout.session.completed` events and calls a database RPC (`fulfill_purchase`) to update user passes and record the purchase atomically and idempotently.

**Tech Stack:** Deno (Edge Functions), Supabase, Stripe, PostgreSQL.

---

### Task 1: Database RPC for Atomic Fulfillment

**Files:**
- Create: `supabase/migrations/20260527_fulfill_purchase_rpc.sql`

- [ ] **Step 1: Write the migration file with the `fulfill_purchase` RPC**

```sql
CREATE OR REPLACE FUNCTION public.fulfill_purchase(
  p_user_id UUID,
  p_card_id UUID,
  p_stripe_payment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card RECORD;
BEGIN
  -- 1. Check for idempotency (already fulfilled)
  IF EXISTS (SELECT 1 FROM public.purchase_records WHERE "stripePaymentId" = p_stripe_payment_id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already fulfilled');
  END IF;

  -- 2. Fetch card details
  SELECT * INTO v_card FROM public.payment_cards WHERE id = p_card_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found');
  END IF;

  -- 3. Update user passes
  UPDATE public.users 
  SET "remainingPasses" = "remainingPasses" + v_card.passes 
  WHERE id = p_user_id;
  
  -- 4. Record the purchase
  INSERT INTO public.purchase_records (
    "userId", 
    "cardId", 
    "cardName", 
    "price", 
    "passesAdded", 
    "stripePaymentId"
  )
  VALUES (
    p_user_id, 
    p_card_id, 
    v_card.title, 
    v_card.price, 
    v_card.passes, 
    p_stripe_payment_id
  );

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

- [ ] **Step 2: Commit the migration**

```bash
git add supabase/migrations/20260527_fulfill_purchase_rpc.sql
git commit -m "feat(db): add fulfill_purchase RPC for stripe fulfillment"
```

---

### Task 2: Stripe Webhook Edge Function

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Write the Edge Function implementation**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not set");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, cardId } = session.metadata || {};
      const stripePaymentId = session.id;

      if (!userId || !cardId) {
        console.error("Missing metadata in session:", session.id);
        return new Response("Missing metadata", { status: 400 });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );

      const { data, error } = await supabaseAdmin.rpc("fulfill_purchase", {
        p_user_id: userId,
        p_card_id: cardId,
        p_stripe_payment_id: stripePaymentId,
      });

      if (error || (data && !data.success)) {
        console.error("Fulfillment failed:", error || data?.error);
        return new Response("Fulfillment error", { status: 500 });
      }

      console.log(`Fulfilled purchase for user ${userId}, card ${cardId}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
```

- [ ] **Step 2: Commit the Edge Function**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "feat(api): add stripe-webhook fulfillment function"
```

---

### Task 3: Verification and Manual Test Strategy

**Files:**
- Create: `supabase/functions/stripe-webhook/test_payload.json` (temporary)

- [ ] **Step 1: Create a test payload for manual verification (mocking Stripe)**

```json
{
  "id": "evt_test_123",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_unique_id_123",
      "metadata": {
        "userId": "YOUR_USER_ID_HERE",
        "cardId": "YOUR_CARD_ID_HERE"
      }
    }
  }
}
```

- [ ] **Step 2: Verify idempotency logic by calling RPC directly (SQL)**

Run in Supabase SQL Editor or via CLI:
```sql
-- Replace with actual IDs from your DB
SELECT fulfill_purchase('USER_ID', 'CARD_ID', 'cs_test_unique_id_123');
-- Run again to verify it returns "Already fulfilled"
SELECT fulfill_purchase('USER_ID', 'CARD_ID', 'cs_test_unique_id_123');
```

- [ ] **Step 3: Final cleanup**

```bash
rm supabase/functions/stripe-webhook/test_payload.json
```
