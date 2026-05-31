# Fix Analytics Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the `get_studio_health` RPC to correctly calculate the studio fill rate by ensuring `maxcount` is only summed once per class instance.

**Architecture:** Use Common Table Expressions (CTEs) to separate class instance capacity summation from booking count aggregation. This prevents the join duplication error.

**Tech Stack:** PostgreSQL (Supabase/PL/pgSQL)

---

### Task 1: Update `get_studio_health` Function

**Files:**
- Modify: `supabase/migrations/20260527_advanced_analytics_rpc.sql`

- [ ] **Step 1: Add variable declarations**

Update the `DECLARE` block to include `v_total_capacity` and `v_total_booked`.

- [ ] **Step 2: Implement CTE-based Fill Rate logic**

Replace the existing fill rate calculation with the CTE approach that correctly aggregates capacity and bookings separately.

- [ ] **Step 3: Commit the change**

```bash
git add supabase/migrations/20260527_advanced_analytics_rpc.sql
git commit --amend --no-edit
```

- [ ] **Step 4: Report "DONE"**
