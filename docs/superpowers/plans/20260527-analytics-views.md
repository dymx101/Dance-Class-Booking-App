# Analytics Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create database aggregation views in Supabase for the analytics dashboard.

**Architecture:** Standard PostgreSQL views defined in a new migration file. These views aggregate data from existing tables (`purchase_records`, `bookings`, `teachers`, `class_instances`, and `users`) to provide server-side computed metrics.

**Tech Stack:** PostgreSQL (Supabase)

---

### Task 1: Create Analytics Views Migration

**Files:**
- Create: `supabase/migrations/20260527_analytics_views.sql`

- [ ] **Step 1: Define `view_revenue_stats`**
Create a view that aggregates revenue by week.
```sql
CREATE OR REPLACE VIEW view_revenue_stats AS
SELECT
    date_trunc('week', date)::date AS week_start,
    sum(price) AS total_revenue,
    count(*) AS purchase_count
FROM purchase_records
GROUP BY 1
ORDER BY week_start DESC;
```

- [ ] **Step 2: Define `view_teacher_performance`**
Create a view that joins teachers, class instances, and bookings to calculate fill rates and waitlist counts.
```sql
CREATE OR REPLACE VIEW view_teacher_performance AS
SELECT
    t.id AS teacher_id,
    t.name AS teacher_name,
    CASE
        WHEN sum(ci.maxcount) = 0 THEN 0
        ELSE count(b.id) FILTER (WHERE b.status IN ('booked', 'attended'))::float / NULLIF(sum(ci.maxcount), 0)
    END AS avg_fill_rate,
    count(b.id) FILTER (WHERE b.status = 'waiting') AS total_waitlist
FROM teachers t
LEFT JOIN class_instances ci ON t.id = ci.teacherid
LEFT JOIN bookings b ON ci.id = b.classid
GROUP BY t.id, t.name;
```

- [ ] **Step 3: Define `view_attendance_heatmap`**
Create a view that groups attendance by day of week and time.
```sql
CREATE OR REPLACE VIEW view_attendance_heatmap AS
SELECT
    extract(dow from ci.date)::int AS day_of_week,
    ci.timestart,
    count(b.id) AS booking_count
FROM class_instances ci
JOIN bookings b ON ci.id = b.classid
WHERE b.status IN ('booked', 'attended')
GROUP BY 1, 2
ORDER BY day_of_week, timestart;
```

- [ ] **Step 4: Define `view_member_stats`**
Create a view that tracks signups and active users by week.
```sql
CREATE OR REPLACE VIEW view_member_stats AS
WITH RECURSIVE weeks AS (
    SELECT date_trunc('week', min(created_at))::date AS week_start
    FROM users
    UNION ALL
    SELECT (week_start + interval '1 week')::date
    FROM weeks
    WHERE week_start < date_trunc('week', now())::date
)
SELECT
    w.week_start,
    (SELECT count(*) FROM users u WHERE date_trunc('week', u.created_at)::date = w.week_start) AS new_signups,
    (SELECT count(distinct b.userid) 
     FROM bookings b 
     WHERE b.timestamp >= (w.week_start + interval '7 days' - interval '30 days')
       AND b.timestamp < (w.week_start + interval '7 days')
       AND b.status IN ('booked', 'attended')
    ) AS active_users
FROM weeks w
ORDER BY w.week_start DESC;
```

- [ ] **Step 5: Add Performance Indexes**
Add indexes to support the aggregations in the views.
```sql
CREATE INDEX IF NOT EXISTS idx_purchase_records_date ON purchase_records(date);
CREATE INDEX IF NOT EXISTS idx_bookings_timestamp ON bookings(timestamp);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
```

- [ ] **Step 6: Commit changes**
Run:
```bash
git add supabase/migrations/20260527_analytics_views.sql
git commit -m "feat(db): add aggregation views for analytics dashboard"
```
