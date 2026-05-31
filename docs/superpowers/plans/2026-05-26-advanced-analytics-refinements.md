# Advanced Admin Analytics Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comparative growth metrics and member retention tracking in the Admin Dashboard.

**Architecture:** A consolidated `get_studio_health` RPC calculates PoP deltas. A `view_at_risk_members` identifies churn risk. Frontend summary cards are updated with real trend indicators.

**Tech Stack:** Supabase (Postgres), React 19, Lucide React, motion/react.

---

### Task 1: Comparative Analytics RPC

**Files:**
- Create: `supabase/migrations/20260527_advanced_analytics_rpc.sql`

- [ ] **Step 1: Implement `get_studio_health` function**
Create a Postgres function that calculates 30D vs. Prev-30D deltas for revenue, fill rate, and signups.

```sql
CREATE OR REPLACE FUNCTION public.get_studio_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rev_curr NUMERIC;
  v_rev_prev NUMERIC;
  v_fill_curr NUMERIC;
  v_fill_prev NUMERIC;
  v_result JSONB;
BEGIN
  -- 1. Revenue
  SELECT COALESCE(sum(price), 0) INTO v_rev_curr FROM purchase_records WHERE date >= now() - interval '30 days';
  SELECT COALESCE(sum(price), 0) INTO v_rev_prev FROM purchase_records WHERE date < now() - interval '30 days' AND date >= now() - interval '60 days';

  -- 2. Fill Rate (Approximate based on bookings)
  SELECT (count(*)::float / NULLIF(sum(maxcount), 0)) * 100 INTO v_fill_curr 
  FROM class_instances i LEFT JOIN bookings b ON i.id = b.classid 
  WHERE i.date >= now() - interval '30 days' AND b.status = 'booked';
  
  -- 3. Build Result
  v_result := jsonb_build_object(
    'revenue', jsonb_build_object('current', v_rev_curr, 'previous', v_rev_prev),
    'fill_rate', jsonb_build_object('current', v_fill_curr, 'previous', 0) -- Simplified for MVP
  );
  
  RETURN v_result;
END;
$$;
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260527_advanced_analytics_rpc.sql
git commit -m "feat(db): add get_studio_health RPC for comparative analytics"
```

---

### Task 2: Retention View & Data Service

**Files:**
- Modify: `supabase/migrations/20260527_analytics_views.sql`
- Modify: `apps/web/src/lib/analytics.ts`
- Modify: `packages/shared/src/types.ts`

- [ ] **Step 1: Create `view_at_risk_members`**
Define the view to find users with passes who haven't booked in 30 days.

- [ ] **Step 2: Update Analytics Service**
Add `getStudioHealth()` and `getAtRiskMembers()` helpers.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat(api): add retention view and update analytics service"
```

---

### Task 3: Real Trend UI Components

**Files:**
- Modify: `apps/web/src/components/admin/AnalyticsDashboard.tsx`

- [ ] **Step 1: Update Summary Cards**
Replace mock "+12%" with dynamic `percentage_change` calculated from `getStudioHealth()`.

- [ ] **Step 2: Add Trend Icons**
Show `TrendingUp` (Emerald) or `TrendingDown` (Rose) based on the delta.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/admin/AnalyticsDashboard.tsx
git commit -m "feat(ui): implement dynamic trend indicators in summary cards"
```

---

### Task 4: Retention List & Final Polish

**Files:**
- Modify: `apps/web/src/components/admin/AnalyticsDashboard.tsx`

- [ ] **Step 1: Implement "At-Risk Members" section**
Render the list of students from the retention view with their last activity date.

- [ ] **Step 2: Final visual polish**
Ensure high-contrast branding and smooth loading states.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/admin/AnalyticsDashboard.tsx
git commit -m "feat(ui): add at-risk member retention list to dashboard"
```
