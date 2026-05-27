-- 1. Revenue Stats View (with gap filling)
CREATE OR REPLACE VIEW view_revenue_stats AS
WITH RECURSIVE weeks AS (
    SELECT date_trunc('week', COALESCE(min(date), now()))::date AS week_start
    FROM purchase_records
    UNION ALL
    SELECT (week_start + interval '1 week')::date
    FROM weeks
    WHERE week_start < date_trunc('week', now())::date
),
weekly_revenue AS (
    SELECT
        date_trunc('week', date)::date AS week_start,
        sum(price) AS total_revenue,
        count(*) AS purchase_count
    FROM purchase_records
    GROUP BY 1
)
SELECT
    w.week_start,
    COALESCE(wr.total_revenue, 0) as total_revenue,
    COALESCE(wr.purchase_count, 0) as purchase_count
FROM weeks w
LEFT JOIN weekly_revenue wr ON w.week_start = wr.week_start
ORDER BY w.week_start DESC;

-- 2. Teacher Performance View
CREATE OR REPLACE VIEW view_teacher_performance AS
WITH instance_stats AS (
  SELECT 
    teacherid,
    count(id) as total_classes,
    sum(maxcount) as total_capacity
  FROM class_instances
  GROUP BY teacherid
),
booking_stats AS (
  SELECT 
    i.teacherid,
    count(b.id) FILTER (WHERE b.status IN ('booked', 'attended')) as total_bookings,
    count(b.id) FILTER (WHERE b.status = 'waiting') as total_waitlist
  FROM class_instances i
  LEFT JOIN bookings b ON i.id = b.classid
  GROUP BY i.teacherid
)
SELECT 
  t.id as teacher_id,
  t.name as teacher_name,
  COALESCE(bs.total_bookings, 0) as total_bookings,
  COALESCE(bs.total_waitlist, 0) as total_waitlist,
  CASE WHEN COALESCE(is_stats.total_capacity, 0) > 0 
       THEN (COALESCE(bs.total_bookings, 0)::float / is_stats.total_capacity::float) * 100 
       ELSE 0 END as avg_fill_rate
FROM teachers t
LEFT JOIN instance_stats is_stats ON t.id = is_stats.teacherid
LEFT JOIN booking_stats bs ON t.id = bs.teacherid;

-- 3. Attendance Heatmap View
CREATE OR REPLACE VIEW view_attendance_heatmap AS
SELECT
    extract(dow from ci.date)::int AS day_of_week,
    ci.timestart AS time_start,
    count(b.id) AS booking_count
FROM class_instances ci
JOIN bookings b ON ci.id = b.classid
WHERE b.status IN ('booked', 'attended')
GROUP BY 1, 2
ORDER BY day_of_week, time_start;

-- 4. Member Stats View (optimized for performance)
CREATE OR REPLACE VIEW view_member_stats AS
WITH RECURSIVE weeks AS (
    SELECT date_trunc('week', COALESCE(min(created_at), now()))::date AS week_start
    FROM users
    UNION ALL
    SELECT (week_start + interval '1 week')::date
    FROM weeks
    WHERE week_start < date_trunc('week', now())::date
)
SELECT
    w.week_start,
    -- Optimized for index usage on users(created_at)
    (SELECT count(*) 
     FROM users u 
     WHERE u.created_at >= w.week_start 
       AND u.created_at < (w.week_start + interval '1 week')
    ) AS new_signups,
    -- Uses index on bookings(timestamp)
    (SELECT count(distinct b.userid) 
     FROM bookings b 
     WHERE b.timestamp >= (w.week_start + interval '7 days' - interval '30 days')
       AND b.timestamp < (w.week_start + interval '7 days')
       AND b.status IN ('booked', 'attended')
    ) AS active_users
FROM weeks w
ORDER BY w.week_start DESC;

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_records_date ON purchase_records(date);
CREATE INDEX IF NOT EXISTS idx_bookings_timestamp ON bookings(timestamp);
CREATE INDEX IF NOT EXISTS idx_bookings_status_timestamp ON bookings(status, timestamp);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_class_instances_teacher_date ON class_instances(teacherid, date);
