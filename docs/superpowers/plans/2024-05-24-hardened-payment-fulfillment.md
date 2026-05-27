# Hardened Payment Fulfillment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the payment fulfillment logic to handle unlimited passes and ensure webhook reliability.

**Architecture:** 
- Fix the SQL RPC function to handle `-1` passes as unlimited (9999).
- Update the Stripe webhook to check for the RPC's success flag.

**Tech Stack:** Supabase (PostgreSQL), Deno (Edge Functions), Stripe API.

---

### Task 1: Update `fulfill_purchase` RPC

**Files:**
- Modify: `supabase/migrations/20260527_fulfill_purchase_rpc.sql`

- [ ] **Step 1: Modify the RPC logic**
  Update the pass calculation in both the `UPDATE` and `INSERT` statements to handle unlimited passes.

```sql
  -- 3. Update user passes
  UPDATE public.users 
  SET "remainingPasses" = "remainingPasses" + (CASE WHEN v_card.passes = -1 THEN 9999 ELSE v_card.passes END)
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
    (CASE WHEN v_card.passes = -1 THEN 9999 ELSE v_card.passes END), 
    p_stripe_payment_id
  );
```

- [ ] **Step 2: Commit changes**

```bash
git add supabase/migrations/20260527_fulfill_purchase_rpc.sql
```

---

### Task 2: Update `stripe-webhook` Edge Function

**Files:**
- Modify: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Update RPC response handling**
  Capture `data` and `error`, and check `data.success`.

```typescript
      // Call the RPC function with corrected parameter name
      const { data, error } = await supabase.rpc("fulfill_purchase", {
        p_user_id: userId,
        p_card_id: cardId,
        p_stripe_payment_id: session.payment_intent
      });

      if (error || !data?.success) {
        throw new Error(`Fulfillment failed: ${error?.message || data?.error}`);
      }
```

- [ ] **Step 2: Commit and amend**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit --amend --no-edit
```
