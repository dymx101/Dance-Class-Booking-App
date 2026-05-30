# Environment Variable Consolidation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate all environment variables into `.env.example` and `.env` with proper grouping for Edge Functions and Frontend.

**Architecture:** Update configuration files to ensure all necessary keys are present for Stripe, WeChat Pay, and Reporting functions.

**Tech Stack:** Env vars, Supabase Edge Functions, Vite.

---

### Task 1: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Write consolidated content to .env.example**

```env
# Supabase (Node/Deno shared)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vite Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# WeChat Pay V3
WECHAT_MCH_ID=your_merchant_id
WECHAT_APP_ID=your_miniprogram_appid
WECHAT_APIV3_KEY=your_api_v3_key
WECHAT_SERIAL_NO=your_certificate_serial_no
WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WECHAT_PLATFORM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
WECHAT_NOTIFY_URL=https://your-project.supabase.co/functions/v1/wechat-pay-webhook

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Automated Reports
RESEND_API_KEY=re_...
OWNER_EMAIL=owner@example.com
REPORT_SECRET=your_cron_secret

# AI / Development (Optional/Existing)
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
ANTHROPIC_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Task 2: Update .env

**Files:**
- Modify: `.env`

- [ ] **Step 1: Write consolidated content to .env**

```env
# Supabase (Node/Deno shared)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vite Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# WeChat Pay V3
WECHAT_MCH_ID=your_merchant_id
WECHAT_APP_ID=your_miniprogram_appid
WECHAT_APIV3_KEY=your_api_v3_key
WECHAT_SERIAL_NO=your_certificate_serial_no
WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WECHAT_PLATFORM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
WECHAT_NOTIFY_URL=https://your-project.supabase.co/functions/v1/wechat-pay-webhook

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Automated Reports
RESEND_API_KEY=re_...
OWNER_EMAIL=owner@example.com
REPORT_SECRET=your_cron_secret

# AI / Development (Optional/Existing)
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
ANTHROPIC_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Task 3: Commit Changes

- [ ] **Step 1: Amend previous commit with updated env files**

Run: `git add .env.example .env && git commit --amend --no-edit`
