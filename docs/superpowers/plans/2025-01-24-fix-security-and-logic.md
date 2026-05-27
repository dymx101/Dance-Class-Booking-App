# Fix Security & Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the admin privilege check by using JWT app metadata and fix a potential race condition/logic flaw in `cancel_booking` by adding a `FOUND` check after record locking.

**Architecture:** 
1. Modify `is_admin()` to use `auth.jwt() -> 'app_metadata' ->> 'role'` instead of user-editable profile fields.
2. Add a `NOT FOUND` check in `cancel_booking` immediately after the `FOR UPDATE` lock to ensure the record still exists.

**Tech Stack:** PostgreSQL (Supabase/PL/pgSQL)

---

### Task 1: Secure `is_admin()` function

**Files:**
- Modify: `supabase/migrations/20260527_rls_hardening.sql`

- [ ] **Step 1: Update `is_admin()` function**

Replace the current implementation with the JWT-based check.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use JWT app_metadata for secure role check
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 2: Remove redundant index**

Since we no longer check `users.name` in `is_admin()`, the index `idx_users_name` added at the end of the file is no longer necessary for this purpose (though it might be useful for other things, the prompt implies hardening/cleanup). However, keeping it doesn't hurt. I'll focus on the requested change.

---

### Task 2: Harden `cancel_booking` RPC

**Files:**
- Modify: `supabase/migrations/20260526_booking_rpc.sql`

- [ ] **Step 1: Add `NOT FOUND` check after lock**

In `public.cancel_booking`, add the check after the `SELECT ... FOR UPDATE` on `public.bookings`.

```sql
    -- 4. Lock the Booking record for update
    SELECT id, "classId", "userId", status INTO v_booking_record
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;
```

---

### Task 3: Commit Changes

- [ ] **Step 1: Add and Amend Commit**

```bash
git add supabase/migrations/20260526_booking_rpc.sql supabase/migrations/20260527_rls_hardening.sql
git commit --amend --no-edit
```

- [ ] **Step 2: Verify Status**

Run `git status` to ensure everything is clean.
