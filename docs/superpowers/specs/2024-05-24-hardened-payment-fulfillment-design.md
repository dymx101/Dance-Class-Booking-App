# Hardened Payment Fulfillment Design

**Goal:** Ensure payment fulfillment is reliable and handles unlimited passes correctly.

## Architecture

1.  **Database Layer (RPC):**
    *   Update `fulfill_purchase` to handle `passes = -1` (unlimited).
    *   Use `CASE` statement to add 9999 passes if unlimited, otherwise add the specified number.
    *   Ensure `purchase_records` also reflects the correct number of passes added.

2.  **Serverless Layer (Webhook):**
    *   Update `stripe-webhook` to check the `success` flag in the RPC return value.
    *   Throw an error if fulfillment fails, ensuring Stripe retries the webhook.

## Data Flow

1.  Stripe sends `checkout.session.completed` event.
2.  Webhook extracts `userId`, `cardId`, and `paymentIntentId`.
3.  Webhook calls `fulfill_purchase(p_user_id, p_card_id, p_stripe_payment_id)`.
4.  RPC checks for idempotency.
5.  RPC calculates passes (handling -1).
6.  RPC updates `users` and inserts into `purchase_records`.
7.  RPC returns `{ success: true }` or `{ success: false, error: ... }`.
8.  Webhook validates response and returns 200 or 400 (triggering retry).

## Error Handling

*   Database errors (e.g., unique constraint on `stripePaymentId`) return `{ success: false, error: ... }`.
*   Connection or runtime errors return a Supabase `error` object.
*   Webhook treats both as failures.
