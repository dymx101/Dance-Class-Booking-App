# WeChat Pay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement native WeChat Pay integration for the Mini Program with secure order signing and automated fulfillment.

**Architecture:** A `create-wechat-order` Edge Function creates a prepay order and signs it for the Mini Program. A `wechat-pay-webhook` handles fulfillment. The Store UI is ported to the Mini Program.

**Tech Stack:** Taro 4, Supabase Edge Functions (Deno/TS), WeChat Pay API V3, Postgres.

---

### Task 1: Mini Program Store Page

**Files:**
- Create: `apps/miniprogram/src/pages/store/index.tsx`
- Create: `apps/miniprogram/src/pages/store/index.css`
- Modify: `apps/miniprogram/src/app.config.ts`

- [ ] **Step 1: Implement Store View**
Re-implement the `StoreView` using Taro native components (`<View>`, `<ScrollView>`). Fetch cards from Supabase.

- [ ] **Step 2: Add Store to App Config**
Register the new page and add it to the TabBar.

- [ ] **Step 3: Commit**
```bash
git add apps/miniprogram/src/pages/store/ apps/miniprogram/src/app.config.ts
git commit -m "feat(mp): add native store page for membership cards"
```

---

### Task 2: Order Signing Edge Function

**Files:**
- Create: `supabase/functions/create-wechat-order/index.ts`
- Create: `supabase/functions/create-wechat-order/utils.ts`

- [ ] **Step 1: Implement V3 Signing Utility**
Create a utility in `utils.ts` for generating the `Authorization` header and pay signatures (RSA).

- [ ] **Step 2: Implement create-wechat-order logic**
Call `/v3/pay/transactions/jsapi` and return the signed parameters to the frontend.

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/create-wechat-order/
git commit -m "feat(api): add create-wechat-order edge function"
```

---

### Task 3: WeChat Pay Webhook Fulfillment

**Files:**
- Create: `supabase/functions/wechat-pay-webhook/index.ts`

- [ ] **Step 1: Implement Notification Decryption**
Handle the AES-256-GCM decryption of the WeChat notification resource.

- [ ] **Step 2: Atomically fulfill purchase**
Call the existing `fulfill_purchase` RPC using the WeChat `transaction_id`.

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/wechat-pay-webhook/index.ts
git commit -m "feat(api): add wechat-pay-webhook for fulfillment"
```

---

### Task 4: Native Payment Handoff

**Files:**
- Modify: `apps/miniprogram/src/pages/store/index.tsx`

- [ ] **Step 1: Call `Taro.requestPayment`**
Connect the "Buy" button to the `create-wechat-order` function and invoke the native modal.

- [ ] **Step 2: Handle success/fail callbacks**
Update the UI and refresh the user profile upon successful payment.

- [ ] **Step 3: Commit**
```bash
git add apps/miniprogram/src/pages/store/index.tsx
git commit -m "feat(mp): integrate native requestPayment flow"
```

---

### Task 5: Security & Verification

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add WeChat Pay placeholders**
```env
WECHAT_MCH_ID=12345678
WECHAT_API_V3_KEY=your_v3_key
WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WECHAT_CERT_SERIAL_NO=YOUR_SERIAL_NO
```

- [ ] **Step 2: Commit**
```bash
git add .env.example
git commit -m "chore: add wechat pay credential placeholders"
```
