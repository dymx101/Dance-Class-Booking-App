# Design Spec: WeChat Pay Integration (Mini Program)

**Date:** 2026-05-26
**Topic:** WeChat Native Payments - Production Phase 9
**Status:** Approved

## 1. Goal
Implement a native WeChat Pay integration for the "Dance-Class-Booking-App" Mini Program using the **WeChat Pay API V3**. This will allow members to purchase class passes securely using FaceID/TouchID and receive automated pass fulfillment via webhooks.

## 2. Architecture: Secure Signing & Fulfillment

### 2.1 Order Creation (`create-wechat-order`)
- **Type:** Supabase Edge Function (Deno/TS).
- **Logic:**
  1. Authenticate user (WeChat OpenID from JWT).
  2. Fetch `card_id` pricing in CNY (¥).
  3. Call WeChat Pay V3 `/jsapi` to create a `prepay_id`.
  4. Generate and RSA-sign the payment parameters using the studio's private key (`apiclient_key.pem`).
  5. Return signed parameters (timestamp, nonce, paySign, etc.) to the Mini Program.

### 2.2 Fulfillment Webhook (`wechat-pay-webhook`)
- **Type:** Supabase Edge Function (Deno/TS).
- **Trigger:** WeChat Pay notification.
- **Logic:**
  1. Verify WeChat signature using the platform's public certificate.
  2. Parse the decrypted notification resource.
  3. **Atomic Fulfillment:** Call the existing `fulfill_purchase` RPC in Postgres.
  4. **Idempotency:** Prevent duplicate pass additions using the WeChat `transaction_id`.

## 3. UI/UX: Native Mini Program Store
- **Store View:** A new native Taro page (`apps/miniprogram/src/pages/store`) displaying membership cards.
- **Native Modal:** Triggered via `Taro.requestPayment`. Provides the "standard" WeChat payment experience.
- **Success Feedback:** Auto-refreshes the profile and displays a success toast.

## 4. Security & Credentials
- **Vault:** Store `WECHAT_MCH_ID`, `WECHAT_API_V3_KEY`, and Private Key in Supabase Secrets.
- **V3 Standard:** Strictly adhere to the API V3 signing and decryption standards.

## 5. Success Criteria
- User can open the Store in the Mini Program and click "Buy".
- The native WeChat payment sheet appears with the correct amount.
- Passes are correctly added to the user's account after successful payment, even if the app is closed.
- System correctly handles "Payment Cancelled" and "Payment Failed" states.
