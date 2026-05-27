# Design Spec: Enhanced Admin Analytics

**Date:** 2026-05-26
**Topic:** Admin Dashboard - Production Phase 6
**Status:** Approved

## 1. Goal
Implement a comprehensive, interactive analytics dashboard for the "Dance-Class-Booking-App" that provides studio owners with actionable insights into revenue, attendance, teacher performance, and member growth using **Postgres Views** and **Recharts**.

## 2. Data Strategy: Server-side Aggregation

### 2.1 Postgres Views
To ensure performance and security, all calculations will be handled on the server via non-quoted, lowercase Postgres Views:
- **`view_revenue_stats`**: Weekly revenue totals from `purchase_records`.
- **`view_attendance_heatmap`**: Fill rates (`booked_count` / `max_count`) grouped by `day_of_week` and `time_start`.
- **`view_teacher_leaderboard`**: Rankings based on average fill rate and waitlist counts.
- **`view_member_stats`**: Weekly new sign-ups and active member counts.

### 2.2 Security
- **RBAC**: Access to analytics views is restricted to users with the `admin` role (verified via `is_admin()` helper).
- **Read-Only**: Views are read-only; no direct modifications to source data are possible through the analytics interface.

## 3. UI/UX Design: Visual Dashboard

### 3.1 Dashboard Layout
A dedicated "Analytics" tab in the Admin Panel featuring a grid of high-level summary cards followed by interactive chart sections.

### 3.2 Visualizations (using Recharts)
- **Revenue Area Chart**: Smoothing line/area chart showing growth over time.
- **Attendance Heatmap**: Grid-based visualization of studio utilization.
- **Teacher Performance Table**: Sorted list with progress bars for fill rates.
- **Growth Bar Chart**: Comparison of active vs. inactive members.

### 3.3 Interactive Controls
- **Date Range Picker**: Global filter for the dashboard (7D, 30D, 90D, custom).
- **Drill-down**: Ability to click a teacher to see their specific performance trends.

## 4. Technical Stack
- **Frontend**: React 19, Recharts, Tailwind CSS.
- **Backend**: Supabase (PostgreSQL), RPC functions for dynamic date-range filtering.

## 5. Success Criteria
- Owner can see total revenue for the current month vs. previous month.
- Owner can identify which day of the week has the lowest attendance to optimize scheduling.
- The dashboard loads in under 1 second even with 50,000+ booking records.
