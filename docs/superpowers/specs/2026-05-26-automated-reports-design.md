# Design Spec: Automated Studio Reports

**Date:** 2026-05-26
**Topic:** Studio Automation - Production Phase 8
**Status:** Approved

## 1. Goal
Implement a fully automated reporting system for the "Dance-Class-Booking-App" that delivers weekly and monthly performance insights (revenue, attendance, instructor rankings) to the studio owner via email.

## 2. Architecture: Automated Data Pipeline

### 2.1 Scheduling (Supabase Cron)
- **Weekly Recap**: Triggered every Monday at 8:00 AM (`0 8 * * 1`).
- **Monthly Deep-Dive**: Triggered on the 1st of every month at 9:00 AM (`0 9 1 * *`).
- **Service**: Uses `pg_net` or `pg_cron` to invoke the `generate-report` Edge Function.

### 2.2 Processing (`generate-report` Edge Function)
- **Type**: Supabase Edge Function (Deno/TS).
- **Data Source**: Fetches from existing Postgres Views (`view_revenue_stats`, `view_teacher_performance`).
- **Templating**: Generates a responsive HTML email using a bilingual "PLAN A" branded template.
- **Delivery**: Integrates with the **Resend API**.

## 3. Email Template Design
- **Header**: High-contrast "PLAN A" branding.
- **Summary Cards**: Quick-glance metrics for Revenue and Avg. Fill Rate.
- **Top Instructors**: Ranked list of teachers with their specific fill rate percentages.
- **CTA**: Secure link to open the full Admin Dashboard.

## 4. Security & Integrity
- **Authentication**: The Edge Function is protected by a `REPORT_SECRET` token to prevent unauthorized triggers.
- **Data Freshness**: Reports always query the live database views, ensuring up-to-the-minute accuracy at the time of generation.

## 5. Success Criteria
- Studio owner receives a clean, readable email every Monday morning.
- Monthly reports accurately reflect long-term trends (growth, churn).
- The system requires zero manual maintenance after initial setup.
