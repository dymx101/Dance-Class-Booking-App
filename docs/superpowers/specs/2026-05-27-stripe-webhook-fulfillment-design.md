# Design Spec: Stripe Webhook Fulfillment

**Date**: 2026-05-27
**Topic**: Fulfill class passes atomically upon successful Stripe payment.

## 1. Overview
Implement a Stripe Webhook in Supabase Edge Functions to listen for `checkout.session.completed` events and update the user's remaining passes atomically.

## 2. Architecture

### 2.1 Database (PostgreSQL RPC)
A new RPC `fulfill_purchase` will handle the atomic update.

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION fulfill_purchase(
  p_user_id UUID,
  p_card_id UUID,
  p_stripe_payment_id TEXT
)
RETURNS JSONB
```

**Logic**:
1. Check `purchase_records` for `stripePaymentId` to ensure idempotency.
2. Fetch card details from `payment_cards`.
3. Update `users.remainingPasses` by adding `payment_cards.passes`.
4. Insert a new record into `purchase_records`.
5. Return success/error JSON.

### 2.2 Edge Function (`stripe-webhook`)
**Logic**:
1. Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`.
2. Parse `checkout.session.completed` event.
3. Extract `userId` and `cardId` from `session.metadata`.
4. Initialize Supabase client with `service_role` key.
5. Call `fulfill_purchase` RPC.
6. Return `200 OK` on success or idempotency match.

## 3. Data Flow
1. Stripe sends POST request to `/functions/v1/stripe-webhook`.
2. Edge Function verifies signature.
3. Edge Function calls `fulfill_purchase(userId, cardId, sessionId)`.
4. DB updates `users` and `purchase_records` in a single transaction.
5. DB returns success.
6. Edge Function returns `200 OK` to Stripe.

## 4. Error Handling
- **Signature Failure**: Return `400 Bad Request`.
- **Missing Metadata**: Log error, return `400 Bad Request`.
- **DB Error**: Log error, return `500 Internal Server Error` (Stripe will retry).
- **Idempotency**: If payment ID already exists, return `200 OK` (already processed).

## 5. Security
- Use `STRIPE_WEBHOOK_SECRET` for verification.
- Use `service_role` key for database operations (bypass RLS).
- Use `SECURITY DEFINER` and `SET search_path = public` for the RPC.

## 6. Testing
- Test with Stripe CLI: `stripe trigger checkout.session.completed`.
- Verify `users.remainingPasses` increases.
- Verify `purchase_records` entry created.
- Verify re-sending the same event doesn't duplicate passes (idempotency).
