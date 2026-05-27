# Final Hardening of cancel_booking RPC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure `cancel_booking` against overbooking and race conditions by implementing robust row-level locking.

**Architecture:** Use PostgreSQL `FOR UPDATE` locks to serialize concurrent access to related records within the `cancel_booking` transaction. Maintain a consistent locking order (`users` -> `class_instances` -> `bookings`) to prevent deadlocks.

**Tech Stack:** PostgreSQL (Supabase), PL/pgSQL

---

### Task 1: Update `cancel_booking` in `supabase/migrations/20260526_booking_rpc.sql`

**Files:**
- Modify: `supabase/migrations/20260526_booking_rpc.sql`

- [ ] **Step 1: Implement the hardened locking logic**

Modify the `cancel_booking` function to include explicit locks in a consistent order.

```sql
<<<<
    -- Lock the booking
    SELECT id, "classId", "userId", status INTO v_booking_record
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    IF v_booking_record."userId" != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    IF v_booking_record.status NOT IN ('booked', 'waiting') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking already cancelled, attended or no_show');
    END IF;

    -- Get class info
    SELECT id, date, "timeStart" INTO v_class_record
    FROM public.class_instances
    WHERE id = v_booking_record."classId";
====
    -- 1. Identify classId without locking first to establish lock order
    SELECT "classId", "userId" INTO v_booking_record
    FROM public.bookings
    WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    IF v_booking_record."userId" != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    -- 2. Lock User record (matching book_class order)
    PERFORM 1 FROM public.users WHERE id = v_user_id FOR UPDATE;

    -- 3. Lock Class Instance record (matching book_class order)
    SELECT id, date, "timeStart" INTO v_class_record
    FROM public.class_instances
    WHERE id = v_booking_record."classId"
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Class not found');
    END IF;

    -- 4. Lock the Booking record for update
    SELECT id, "classId", "userId", status INTO v_booking_record
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    -- Verify status again after lock
    IF v_booking_record.status NOT IN ('booked', 'waiting') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking already cancelled, attended or no_show');
    END IF;
>>>>
```

- [ ] **Step 2: Verify the complete function code**

Ensure the final function looks correct and handles the refund/promotion logic as before, but with the new locks.

- [ ] **Step 3: Commit and Amend**

```bash
git add supabase/migrations/20260526_booking_rpc.sql
git commit --amend --no-edit
```
