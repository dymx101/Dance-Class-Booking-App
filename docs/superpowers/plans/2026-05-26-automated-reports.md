# Automated Studio Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated weekly and monthly performance reports delivered via email.

**Architecture:** A `generate-report` Edge Function queries existing analytics views and sends a branded HTML email via Resend. The function is triggered by a Supabase Cron job.

**Tech Stack:** Supabase Edge Functions (Deno/TS), Resend API, Postgres.

---

### Task 1: Report Generation Logic

**Files:**
- Create: `supabase/functions/generate-report/index.ts`
- Create: `supabase/functions/generate-report/template.ts`

- [ ] **Step 1: Scaffold generate-report function**
Implement the Deno function that queries `view_revenue_stats` and `view_teacher_performance`.

- [ ] **Step 2: Implement HTML Template**
Create a responsive MJML-style HTML template in `template.ts` with bilingual headers.

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/generate-report/
git commit -m "feat(api): add generate-report edge function and template"
```

---

### Task 2: Resend Email Integration

**Files:**
- Modify: `supabase/functions/generate-report/index.ts`
- Modify: `.env.example`

- [ ] **Step 1: Connect to Resend API**
Add the delivery logic using `RESEND_API_KEY`.

- [ ] **Step 2: Add environment placeholders**
```env
RESEND_API_KEY=re_...
OWNER_EMAIL=owner@example.com
REPORT_SECRET=your_cron_secret
```

- [ ] **Step 3: Commit**
```bash
git add .env.example supabase/functions/generate-report/index.ts
git commit -m "feat(api): integrate resend for report delivery"
```

---

### Task 3: Supabase Cron Scheduling

**Files:**
- Create: `supabase/migrations/20260527_report_cron.sql`

- [ ] **Step 1: Enable pg_net and define schedules**
Write a migration that sets up the weekly and monthly cron jobs.

```sql
-- Weekly Report (Monday 8AM)
SELECT cron.schedule(
  'weekly-studio-report',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-report',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your_cron_secret"}',
    body := '{"type": "weekly"}'
  )
  $$
);
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260527_report_cron.sql
git commit -m "feat(db): add cron schedules for automated reports"
```

---

### Task 4: Final Verification & Test Trigger

**Files:**
- Modify: `supabase/functions/generate-report/index.ts`

- [ ] **Step 1: Implement Manual Trigger**
Allow the function to be triggered manually via a POST request for testing purposes.

- [ ] **Step 2: Commit**
```bash
git add supabase/functions/generate-report/index.ts
git commit -m "test(api): add manual trigger for report verification"
```
