# Analytics Aggregation Views Design

## Goal
Handle heavy analytics math on the server via Postgres Views to power the analytics dashboard in the Dance Class Booking App.

## Architecture
The design utilizes standard Postgres views to aggregate data from `purchase_records`, `bookings`, `teachers`, `class_instances`, and `users`. These views provide a clean interface for the frontend to fetch pre-calculated statistics without complex client-side logic or multiple API calls.

## Database Views

### 1. `view_revenue_stats`
Aggregates revenue from `purchase_records` by week.
- **Columns:**
  - `week_start` (DATE): The start of the week (Monday).
  - `total_revenue` (NUMERIC): Sum of `price` for that week.
  - `purchase_count` (BIGINT): Count of records for that week.

### 2. `view_teacher_performance`
Calculates performance metrics for each teacher.
- **Columns:**
  - `teacher_id` (UUID): Reference to `teachers.id`.
  - `teacher_name` (TEXT): Reference to `teachers.name`.
  - `avg_fill_rate` (FLOAT): `count(bookings) / sum(maxcount)` across all class instances for the teacher.
  - `total_waitlist` (BIGINT): Count of bookings with `status = 'waiting'`.

### 3. `view_attendance_heatmap`
Groups attendance data by day of the week and time.
- **Columns:**
  - `day_of_week` (INTEGER): 0-6 (Sunday to Saturday).
  - `time_start` (TIME): The start time of the class.
  - `booking_count` (BIGINT): Count of bookings with `status` as 'attended' or 'booked'.

### 4. `view_member_stats`
Tracks signup growth and user activity over time.
- **Columns:**
  - `week_start` (DATE): The start of the week.
  - `new_signups` (BIGINT): Count of users created in that week.
  - `active_users` (BIGINT): Count of unique users who made at least one booking (status 'booked' or 'attended') in the 30 days leading up to the end of that week.

## Performance Considerations
- The views leverage existing indexes on `class_instances(date)`, `bookings(classid)`, and `bookings(userid)`.
- To improve `view_revenue_stats` and `view_member_stats`, additional indexes on `purchase_records(date)`, `bookings(timestamp)`, and `users(created_at)` are recommended.

## Success Criteria
- Views are accessible via Supabase/Postgres.
- Identifiers are lowercase and non-quoted.
- Calculations match the business logic requirements.
