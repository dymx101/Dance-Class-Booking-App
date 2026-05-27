# Design Spec: Stripe Payment Integration

**Date:** 2026-05-26
**Topic:** Stripe Payments - Production Phase 4
**Status:** Approved

## 1. Goal
Implement a secure, production-grade payment system for the "Dance-Class-Booking-App" using **Stripe Checkout** and **Supabase Edge Functions**. This will allow members to purchase class passes which are automatically fulfilled in the database.

## 2. Architecture: Edge Function & Webhooks

### 2.1 Checkout Session Creation (`create-checkout`)
- **Type:** Supabase Edge Function (Deno/TS).
- **Trigger:** Frontend "Confirm Payment" button.
- **Logic:**
  1. Authenticate user via Supabase Auth JWT.
  2. Fetch requested `card_id` pricing and pass details.
  3. Create Stripe Checkout Session with `metadata = { userId, cardId }`.
  4. Return secure `session.url` to frontend.

### 2.2 Payment Fulfillment (`stripe-webhook`)
- **Type:** Supabase Edge Function (Deno/TS).
- **Trigger:** Stripe webhook event (`checkout.session.completed`).
- **Security:** Signature verification using `STRIPE_WEBHOOK_SECRET`.
- **Logic:**
  1. Verify the signature and extract `userId` and `cardId` from metadata.
  2. **Atomic Fulfillment:**
     - Increment `users.remainingPasses`.
     - Insert record into `purchase_records`.
  3. **Idempotency:** Use `payment_intent_id` as a unique identifier to prevent duplicate fulfillment.

## 3. Data Model Updates
- **`purchase_records`**: (Extended) Add `stripe_payment_id` column with a UNIQUE constraint for idempotency.

## 4. Frontend Integration (`StoreView.tsx`)
- Replace mock `handlePaymentConfirm` logic.
- Call `supabase.functions.invoke('create-checkout')`.
- Handle loading state and redirect to Stripe.

## 5. Security & Safety
- **Keys:** Stripe Secret Key and Webhook Secret are stored in Supabase Vault/Secrets.
- **Verification:** Signature verification is MANDATORY for all webhook requests.
- **Atomicity:** Fulfillment must use a single Postgres transaction or RPC call.

## 6. Success Criteria
- User clicks "Pay", is redirected to Stripe, and pays successfully.
- User returns to the app and sees their pass balance updated within seconds.
- Closing the browser tab after payment still results in successful pass fulfillment (via webhook).
- Duplicate webhook calls do not result in extra passes.
