# Secure Booking System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the booking system by hardening RLS on the `bookings` table and adding validation to the RPC functions.

**Architecture:** All booking modifications (INSERT/UPDATE/DELETE) are restricted to RPC functions or Admins via RLS. RPC functions are secured with a explicit search path and additional business logic validation.

**Tech Stack:** PostgreSQL (PL/pgSQL), Supabase RLS.

---

### Task 1: Hardening RLS on `bookings` table

**Files:**
- Modify: `supabase/migrations/20260527_rls_hardening.sql`

- [ ] **Step 1: Remove direct user modification policies**

Replace the existing policy definitions for `bookings` with a more restrictive set that only allows `SELECT` for regular users.

```sql
-- 8. Bookings table: User READ-ONLY + Admin FULL CONTROL
DROP POLICY IF EXISTS "Users Insert Own Bookings" ON bookings;
DROP POLICY IF EXISTS "Users Update Own Bookings" ON bookings;

-- Ensure Users can only SELECT their own bookings
-- (Policy "Users Read Own Bookings" already exists in initial schema, but we can re-create it here for clarity or just rely on it)
-- To be safe, we ensure only SELECT is allowed for users.

CREATE POLICY "Admins Manage All Bookings" ON bookings 
    FOR ALL USING (public.is_admin());
```

Wait, I should check `20260526_initial_schema.sql` to see if I should drop the INSERT policy there or just drop it in the hardening file. The instruction says "Update `supabase/migrations/20260527_rls_hardening.sql`".

### Task 2: Secure and Improve Booking RPC Functions

**Files:**
- Modify: `supabase/migrations/20260526_booking_rpc.sql`

- [ ] **Step 1: Update `book_class` function logic and security**

Add `SET search_path = public`, past-booking validation, and updated capacity check.

```sql
CREATE OR REPLACE FUNCTION public.book_class(p_instance_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_passes INT;
    v_class_record RECORD;
    v_booked_count INT;
    v_status TEXT;
    v_queue_number INT;
    v_booking_id UUID;
    v_existing_status TEXT;
    v_class_timestamp TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- ... (rest of the logic)
```

- [ ] **Step 2: Update `cancel_booking` function security**

Add `SET search_path = public`.

### Task 3: Commit Changes

- [ ] **Step 1: Git commit**

```bash
git add supabase/migrations/
git commit --amend --no-edit
```
