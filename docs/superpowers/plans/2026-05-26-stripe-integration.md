# Stripe Payment Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement secure Stripe Checkout payments with automated fulfillment via Supabase Edge Functions.

**Architecture:** Frontend calls an Edge Function to create a Checkout Session. Stripe sends a webhook upon success. A second Edge Function handles the webhook to update user passes and log the purchase atomically.

**Tech Stack:** Supabase Edge Functions (Deno/TS), Stripe API, Postgres.

---

### Task 1: Database Idempotency & Schema Update

**Files:**
- Create: `supabase/migrations/20260527_payment_idempotency.sql`

- [ ] **Step 1: Add Stripe fields to purchase_records**
Add `stripePaymentId` column with a UNIQUE constraint to prevent duplicate fulfillment.

```sql
-- supabase/migrations/20260527_payment_idempotency.sql
ALTER TABLE public.purchase_records 
ADD COLUMN IF NOT EXISTS "stripePaymentId" TEXT UNIQUE;
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260527_payment_idempotency.sql
git commit -m "feat(db): add stripePaymentId for idempotency"
```

---

### Task 2: Create Checkout Session Edge Function

**Files:**
- Create: `supabase/functions/create-checkout/index.ts`

- [ ] **Step 1: Scaffold create-checkout function**
Implement the Deno function that validates the user, fetches the card price, and returns a Stripe URL.

- [ ] **Step 2: Handle Stripe Secret Key**
Ensure the function uses `Deno.env.get('STRIPE_SECRET_KEY')`.

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/create-checkout/index.ts
git commit -m "feat(api): add create-checkout edge function"
```

---

### Task 3: Stripe Webhook Fulfillment Edge Function

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Implement Signature Verification**
Use `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.

- [ ] **Step 2: Implement Fulfillment Logic**
Listen for `checkout.session.completed`, extract metadata, and update `users.remainingPasses` + insert `purchase_records`.

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "feat(api): add stripe-webhook fulfillment function"
```

---

### Task 4: Frontend Integration (StoreView)

**Files:**
- Modify: `src/components/StoreView.tsx`

- [ ] **Step 1: Replace mock payment logic**
Update `handlePaymentConfirm` to call `supabase.functions.invoke('create-checkout')`.

- [ ] **Step 2: Implement redirect**
Use `window.location.href = data.url` on success.

- [ ] **Step 3: Commit**
```bash
git add src/components/StoreView.tsx
git commit -m "feat(ui): integrate real stripe checkout in StoreView"
```

---

### Task 5: Security & Verification

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add Stripe placeholders**
```env
# Stripe Configuration (used in Edge Functions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- [ ] **Step 2: Commit**
```bash
git add .env.example
git commit -m "chore: add stripe key placeholders"
```
