# Private Coaching Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an on-demand private coaching booking system with teacher availability tracking and dedicated pass management.

**Architecture:** Extended database schema with availability and booking tables. Atomic Postgres RPC handles the session requests. A "Teacher-First" frontend flow allows members to browse and book 1-on-1 sessions.

**Tech Stack:** Supabase (PostgreSQL), React 19, Lucide React, motion/react.

---

### Task 1: Database Schema & Atomic RPC

**Files:**
- Create: `supabase/migrations/20260526_private_coaching_schema.sql`

- [ ] **Step 1: Implement schema updates**
Add `privatepasses` to users, create `teacher_availability` and `private_bookings` tables.

```sql
-- apps/web/supabase/migrations/20260526_private_coaching_schema.sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privatepasses INTEGER DEFAULT 0;

CREATE TABLE public.teacher_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacherid UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  dayofweek INTEGER NOT NULL CHECK (dayofweek BETWEEN 0 AND 6),
  timestart TIME NOT NULL,
  timeend TIME NOT NULL,
  createdat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.private_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  teacherid UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  scheduledat TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  notes TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_bookings ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Implement `request_private_session` RPC**
Create an atomic function to validate passes and insert the booking request.

```sql
CREATE OR REPLACE FUNCTION public.request_private_session(
  p_teacher_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_passes INT;
BEGIN
  -- 1. Check user passes
  SELECT privatepasses INTO v_passes FROM public.users WHERE id = v_user_id FOR UPDATE;
  IF v_passes <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_private_passes');
  END IF;

  -- 2. Deduct pass
  UPDATE public.users SET privatepasses = privatepasses - 1 WHERE id = v_user_id;

  -- 3. Insert booking
  INSERT INTO public.private_bookings (userid, teacherid, scheduledat, notes)
  VALUES (v_user_id, p_teacher_id, p_scheduled_at, p_notes);

  RETURN jsonb_build_object('success', true);
END;
$$;
```

- [ ] **Step 3: Commit migration**
```bash
git add supabase/migrations/20260526_private_coaching_schema.sql
git commit -m "feat(db): add private coaching schema and request RPC"
```

---

### Task 2: Data Service & Shared Types

**Files:**
- Modify: `packages/shared/src/types.ts`
- Create: `apps/web/src/lib/coaching.ts`

- [ ] **Step 1: Update shared types**
Add `TeacherAvailability` and `PrivateBooking` interfaces.

- [ ] **Step 2: Implement coaching data service**
Add `getTeacherAvailability(teacherId)` and `requestPrivateSession(data)` helpers.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat(api): add coaching data service and shared types"
```

---

### Task 3: Teacher-First Booking UI

**Files:**
- Create: `apps/web/src/components/PrivateCoachingView.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Build PrivateCoachingView shell**
Implement the teacher browsing list and selection state.

- [ ] **Step 2: Build AvailabilityGrid component**
Render a time-slot picker based on the selected instructor's data.

- [ ] **Step 3: Integrate into App**
Add the "Private Coaching" tab to the main navigation.

- [ ] **Step 4: Commit UI**
```bash
git add apps/web/src/components/PrivateCoachingView.tsx apps/web/src/App.tsx
git commit -m "feat(ui): implement private coaching booking interface"
```

---

### Task 4: Request Modal & State Sync

**Files:**
- Modify: `apps/web/src/components/PrivateCoachingView.tsx`
- Modify: `apps/web/src/components/ProfileView.tsx`

- [ ] **Step 1: Implement BookingRequestModal**
Add the notes field and final confirmation logic using the RPC.

- [ ] **Step 2: Show private bookings in Profile**
Update the "My Bookings" section to include 1-on-1 requests.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat(ui): add booking request modal and profile integration"
```
