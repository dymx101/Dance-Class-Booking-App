# Booking Logic & Waitlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement atomic booking transactions, waitlist management, and strict cancellation policies using Supabase RPC and triggers.

**Architecture:** Atomic Postgres functions (RPC) handle the business logic to prevent race conditions. Frontend uses these functions to interact with the database.

**Tech Stack:** Supabase (PostgreSQL), React 19, TypeScript, motion/react.

---

### Task 1: Atomic Booking & Cancellation Functions

**Files:**
- Create: `supabase/migrations/20260526_booking_rpc.sql`

- [x] **Step 1: Implement `book_class` RPC function**
Create a Postgres function that handles the atomic steps of booking or waitlisting.

```sql
CREATE OR REPLACE FUNCTION public.book_class(p_instance_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_passes INT;
  v_max_count INT;
  v_current_count INT;
  v_status TEXT;
  v_queue_number INT;
BEGIN
  -- 1. Check user passes
  SELECT remaining_passes INTO v_passes FROM public.users WHERE id = v_user_id;
  IF v_passes <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_passes');
  END IF;

  -- 2. Check class capacity
  SELECT max_count INTO v_max_count FROM public.class_instances WHERE id = p_instance_id;
  SELECT count(*) INTO v_current_count FROM public.bookings WHERE class_id = p_instance_id AND status = 'booked';

  -- 3. Determine status
  IF v_current_count < v_max_count THEN
    v_status := 'booked';
    v_queue_number := NULL;
    -- Deduct pass
    UPDATE public.users SET remaining_passes = remaining_passes - 1 WHERE id = v_user_id;
  ELSE
    v_status := 'waiting';
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_queue_number 
    FROM public.bookings WHERE class_id = p_instance_id;
    -- Freeze pass (Optional but recommended for waitlist integrity)
    UPDATE public.users SET remaining_passes = remaining_passes - 1 WHERE id = v_user_id;
  END IF;

  -- 4. Insert booking
  INSERT INTO public.bookings (class_id, user_id, status, queue_number)
  VALUES (p_instance_id, v_user_id, v_status, v_queue_number);

  RETURN jsonb_build_object('success', true, 'status', v_status);
END;
$$;
```

- [x] **Step 2: Implement `cancel_booking` RPC function**
Create a function that enforces the 1-hour cancellation rule.

```sql
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_class_id UUID;
  v_start_time TIMESTAMPTZ;
  v_booking_status TEXT;
BEGIN
  -- 1. Get booking details
  SELECT class_id, status INTO v_class_id, v_booking_status 
  FROM public.bookings WHERE id = p_booking_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'booking_not_found');
  END IF;

  -- 2. Get class start time (assuming date + start_time)
  -- Simplified for now: just using a timestamp column if available
  SELECT (date + start_time) INTO v_start_time 
  FROM public.class_instances WHERE id = v_class_id;

  -- 3. Check 1-hour rule
  IF v_start_time - now() > interval '1 hour' THEN
    -- On time: Delete and refund
    DELETE FROM public.bookings WHERE id = p_booking_id;
    UPDATE public.users SET remaining_passes = remaining_passes + 1 WHERE id = v_user_id;
    RETURN jsonb_build_object('success', true, 'refunded', true);
  ELSE
    -- Late: Mark as no-show, no refund
    UPDATE public.bookings SET status = 'no_show' WHERE id = p_booking_id;
    RETURN jsonb_build_object('success', true, 'refunded', false, 'error', 'late_cancellation');
  END IF;
END;
$$;
```

- [x] **Step 3: Commit migration**
```bash
git add supabase/migrations/20260526_booking_rpc.sql
git commit -m "feat(db): add atomic booking and cancellation functions"
```

---

### Task 2: Waitlist Promotion Trigger

**Files:**
- Create: `supabase/migrations/20260526_waitlist_trigger.sql`

- [x] **Step 1: Create automatic promotion trigger**
Write a trigger that promotes the first person in the waitlist when a booking is deleted (cancelled on time).

```sql
CREATE OR REPLACE FUNCTION public.handle_waitlist_promotion()
RETURNS TRIGGER AS $$
DECLARE
  v_next_booking_id UUID;
BEGIN
  -- Find the first person in the waitlist for the cancelled class
  SELECT id INTO v_next_booking_id
  FROM public.bookings
  WHERE class_id = OLD.class_id AND status = 'waiting'
  ORDER BY queue_number ASC
  LIMIT 1;

  IF FOUND THEN
    -- Promote them to booked
    UPDATE public.bookings 
    SET status = 'booked', queue_number = NULL
    WHERE id = v_next_booking_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_deleted
  AFTER DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_waitlist_promotion();
```

- [x] **Step 2: Commit**
```bash
git add supabase/migrations/20260526_waitlist_trigger.sql
git commit -m "feat(db): add automatic waitlist promotion trigger"
```

---

### Task 3: Frontend RPC Integration

**Files:**
- Modify: `src/components/ScheduleView.tsx`

- [x] **Step 1: Replace `handleBookingToggle` with RPC call**
Update the frontend to use `supabase.rpc('book_class')` and `supabase.rpc('cancel_booking')`.

- [x] **Step 2: Update UI states**
Ensure the button shows "退约" (Unbook) or "排队" (Waitlist) based on the real server status.

- [x] **Step 3: Commit**
```bash
git add src/components/ScheduleView.tsx
git commit -m "feat(ui): integrate booking RPC functions into ScheduleView"
```

---

### Task 4: Error Handling & UX Polish

**Files:**
- Modify: `src/components/ScheduleView.tsx`

- [x] **Step 1: Implement bilingual error feedback**
Map error codes from RPC to user-friendly messages.

```typescript
const BOOKING_ERRORS: Record<string, string> = {
  'insufficient_passes': '课次余额不足 (Insufficient passes)',
  'late_cancellation': '已超过取消时间，课次不予退回 (Late cancellation, no refund)',
  'default': '操作失败，请重试 (Action failed, please try again)'
};
```

- [x] **Step 2: Add loading states**
Prevent double-clicks during the RPC transaction.

- [x] **Step 3: Commit**
```bash
git add src/components/ScheduleView.tsx
git commit -m "fix(ui): add booking error handling and loading states"
```
