# Enhanced Admin Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a production-grade interactive analytics dashboard for studio owners using Postgres Views and Recharts.

**Architecture:** Data aggregation is handled by Postgres Views for maximum performance. A central `AnalyticsView` component consumes this data and renders interactive charts.

**Tech Stack:** React 19, Recharts, Lucide React, Supabase (Postgres).

---

### Task 1: Database Aggregation Views

**Files:**
- Create: `supabase/migrations/20260527_analytics_views.sql`

- [ ] **Step 1: Create Revenue Stats View**
Aggregate `purchase_records` by week.

- [ ] **Step 2: Create Teacher Performance View**
Calculate average fill rate and waitlist counts per teacher.

- [ ] **Step 3: Create Attendance Heatmap View**
Group `bookings` by day of week and time.

- [ ] **Step 4: Create Member Growth View**
Count active members and new signups by week.

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/20260527_analytics_views.sql
git commit -m "feat(db): add aggregation views for analytics dashboard"
```

---

### Task 2: Analytics Data Service & Types

**Files:**
- Create: `src/lib/analytics.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Define Analytics Types**
Add interfaces for `RevenueStat`, `TeacherPerformance`, `HeatmapData`, and `GrowthStat`.

- [ ] **Step 2: Implement Data Fetching Helpers**
Write functions to fetch data from the new Postgres Views via Supabase.

- [ ] **Step 3: Commit**
```bash
git add src/types.ts src/lib/analytics.ts
git commit -m "feat(api): add analytics data service and types"
```

---

### Task 3: Analytics Dashboard UI (MVP)

**Files:**
- Create: `src/components/admin/AnalyticsDashboard.tsx`
- Modify: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Build Summary Cards**
Implement the top row of stat cards (Revenue, Fill Rate, Active Members, No-shows).

- [ ] **Step 2: Integrate into AdminLayout**
Add the "Analytics" tab to the sidebar and route.

- [ ] **Step 3: Commit**
```bash
git add src/components/admin/AnalyticsDashboard.tsx src/components/admin/AdminLayout.tsx
git commit -m "feat(ui): add analytics dashboard shell and summary cards"
```

---

### Task 4: Interactive Charts (Recharts)

**Files:**
- Modify: `src/components/admin/AnalyticsDashboard.tsx`

- [ ] **Step 1: Install Recharts**
Run: `npm install recharts`

- [ ] **Step 2: Implement Revenue Area Chart**
Render the weekly revenue trend.

- [ ] **Step 3: Implement Attendance Heatmap**
Render the grid-based studio utilization chart.

- [ ] **Step 4: Implement Teacher Leaderboard**
Display the ranked instructor list with fill-rate progress bars.

- [ ] **Step 5: Commit**
```bash
git add src/components/admin/AnalyticsDashboard.tsx package.json
git commit -m "feat(ui): implement interactive charts using recharts"
```

---

### Task 5: Date Range Filtering & Final Polish

**Files:**
- Modify: `src/components/admin/AnalyticsDashboard.tsx`

- [ ] **Step 1: Implement Date Range Picker**
Add a dropdown/picker to filter all dashboard data by period (7D, 30D, 90D).

- [ ] **Step 2: Add Loading & Error States**
Ensure smooth UX while data is aggregating.

- [ ] **Step 3: Commit**
```bash
git add src/components/admin/AnalyticsDashboard.tsx
git commit -m "feat(ui): add date filtering and final polish to analytics"
```
