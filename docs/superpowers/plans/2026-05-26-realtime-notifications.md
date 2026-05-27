# Real-time Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement in-app real-time notifications and live schedule synchronization using Supabase Realtime and Postgres triggers.

**Architecture:** A `notifications` table stores member alerts. Postgres triggers automatically generate notifications on booking events. A React Context manages the Realtime subscription and state for unread counts and live toasts.

**Tech Stack:** Supabase Realtime, Postgres, React 19, motion/react.

---

### Task 1: Notifications Schema & Automation

**Files:**
- Create: `supabase/migrations/20260527_notifications_schema.sql`

- [ ] **Step 1: Create notifications table**
Define the table for storing user-specific alerts.

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  isread BOOLEAN DEFAULT false,
  createdat TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = userid);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = userid);
```

- [ ] **Step 2: Implement Waitlist Promotion Notification Trigger**
Update `handle_waitlist_promotion` to also insert an alert.

```sql
-- Inside handle_waitlist_promotion
INSERT INTO public.notifications (userid, type, title, message)
VALUES (v_promoted_user_id, 'waitlist_promoted', '预约成功 (Booking Successful)', '您已从候补名单转为正式预约！');
```

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/20260527_notifications_schema.sql
git commit -m "feat(db): add notifications table and promotion alerts"
```

---

### Task 2: Notification State & Realtime Context

**Files:**
- Create: `src/contexts/NotificationContext.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Implement NotificationProvider**
Manage global realtime subscriptions for both notifications and schedule updates.

- [ ] **Step 2: Add unread count logic**
Fetch and track the count of `isread = false`.

- [ ] **Step 3: Commit**
```bash
git add src/contexts/NotificationContext.tsx src/main.tsx
git commit -m "feat(auth): add NotificationContext with realtime subscriptions"
```

---

### Task 3: Live Toast & Unread UI

**Files:**
- Create: `src/components/notifications/LiveToast.tsx`
- Create: `src/components/notifications/NotificationCenter.tsx`
- Modify: `src/components/ProfileView.tsx`

- [ ] **Step 1: Build LiveToast component**
Animated alert that appears on top of the screen using `motion/react`.

- [ ] **Step 2: Build NotificationCenter**
 Chronological list of alerts with "Mark all as read" button.

- [ ] **Step 3: Integrate unread badges**
Show red dots on the Profile and bell icon.

- [ ] **Step 4: Commit**
```bash
git add src/components/notifications src/components/ProfileView.tsx
git commit -m "feat(ui): implement notification center and live toasts"
```

---

### Task 4: Global Schedule Sync (Live Spots)

**Files:**
- Modify: `src/contexts/NotificationContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Subscribe to bookings changes**
Broadcast `bookedCount` updates globally so `ScheduleView` stays in sync.

- [ ] **Step 2: Commit**
```bash
git add src/contexts/NotificationContext.tsx src/App.tsx
git commit -m "feat(realtime): implement live schedule synchronization"
```
