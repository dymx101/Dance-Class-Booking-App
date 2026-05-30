# WeChat Pay Credentials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the user knows which WeChat Pay keys to provide for the Edge Functions and that they are present in the local environment for testing.

**Architecture:** Add placeholders to `.env.example` and append them to `.env` if not present.

**Tech Stack:** Environment Variables

---

### Task 1: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Append WeChat Pay placeholders to .env.example**

```env
# WeChat Pay Configuration (used in Edge Functions)
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_V3_KEY=your_api_v3_key
WECHAT_CERT_SERIAL_NO=your_certificate_serial_no
WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WECHAT_PLATFORM_CERT_SERIAL_NO=wechat_platform_serial_no
WECHAT_PLATFORM_CERT_CONTENT="-----BEGIN CERTIFICATE-----..."
```

- [ ] **Step 2: Verify .env.example content**

Run: `cat .env.example`
Expected: Includes the new WeChat Pay section.

### Task 2: Update .env

**Files:**
- Modify: `.env`

- [ ] **Step 1: Append WeChat Pay placeholders to .env if not present**

Check if `WECHAT_MCH_ID` exists in `.env`. If not, append the same block as Task 1.

- [ ] **Step 2: Verify .env has the placeholders (without printing values)**

Run: `grep "WECHAT_" .env`
Expected: Lists the WeChat Pay keys.

### Task 3: Commit .env.example

**Files:**
- Commit: `.env.example`

- [ ] **Step 1: Stage and commit .env.example**

Run: `git add .env.example && git commit -m "chore: add wechat pay credential placeholders"`
Expected: Commit successful.
