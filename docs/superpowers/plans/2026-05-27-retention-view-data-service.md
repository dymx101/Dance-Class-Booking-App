# Retention View & Data Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the member retention view and update the data service to identify at-risk members and provide studio health data to the frontend.

**Architecture:** 
- Add shared TypeScript interfaces for analytics data.
- Create a PostgreSQL view to identify "at-risk" members based on inactivity.
- Update the analytics service in the web application to fetch data from the new view and an existing RPC.

**Tech Stack:** TypeScript, Supabase (PostgreSQL), React (apps/web)

---

### Task 1: Update Shared Types

**Files:**
- Modify: `packages/shared/src/types.ts`

- [ ] **Step 1: Define StudioHealth and AtRiskMember interfaces**

```typescript
export interface StudioHealth {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  signups: {
    current: number;
    previous: number;
    growth: number;
  };
  fillrate: number;
  noshowrate: number;
}

export interface AtRiskMember {
  user_id: string;
  name: string;
  avatar: string;
  remainingpasses: number;
  last_active_date: string | null;
  days_inactive: number | null;
}
```

- [ ] **Step 2: Verify types are exported correctly**

### Task 2: Create Retention View in Supabase

**Files:**
- Modify: `supabase/migrations/20260527_analytics_views.sql`

- [ ] **Step 1: Define view_at_risk_members**

```sql
-- 6. At-Risk Members View
-- Users with remaining passes who haven't booked in 30+ days, or never booked.
CREATE OR REPLACE VIEW view_at_risk_members AS
WITH last_bookings AS (
    SELECT 
        userid, 
        max(timestamp) as last_active_date
    FROM bookings
    WHERE status IN ('booked', 'attended')
    GROUP BY userid
)
SELECT 
    u.id as user_id,
    u.name,
    u.avatar,
    u.remainingpasses,
    lb.last_active_date,
    EXTRACT(DAY FROM (now() - lb.last_active_date))::int as days_inactive
FROM users u
LEFT JOIN last_bookings lb ON u.id = lb.userid
WHERE u.remainingpasses > 0
  AND (
    lb.last_active_date IS NULL -- Never booked
    OR lb.last_active_date < (now() - interval '30 days') -- Inactive for 30+ days
  )
ORDER BY lb.last_active_date ASC NULLS FIRST;
```

### Task 3: Update Analytics Data Service

**Files:**
- Modify: `apps/web/src/lib/analytics.ts`

- [ ] **Step 1: Implement getStudioHealth()**

```typescript
/**
 * Fetches overall studio health metrics via RPC.
 */
export const getStudioHealth = async (): Promise<StudioHealth> => {
  const { data, error } = await supabase.rpc('get_studio_health');
  
  if (error) {
    console.error('Error fetching studio health:', error);
    throw error;
  }
  
  return data as StudioHealth;
};
```

- [ ] **Step 2: Implement getAtRiskMembers()**

```typescript
/**
 * Fetches members at risk of churning from the view_at_risk_members view.
 */
export const getAtRiskMembers = async (): Promise<AtRiskMember[]> => {
  const { data, error } = await supabase
    .from('view_at_risk_members')
    .select('*')
    .order('last_active_date', { ascending: true, nullsFirst: true });
  
  if (error) {
    console.error('Error fetching at-risk members:', error);
    throw error;
  }
  
  return data || [];
};
```

### Task 4: Verification & Commit

- [ ] **Step 1: Verify changes with a dummy test script or by running build**
- [ ] **Step 2: Commit changes**

```bash
git add packages/shared/src/types.ts supabase/migrations/20260527_analytics_views.sql apps/web/src/lib/analytics.ts
git commit -m "feat(api): add retention view and update analytics service"
```
