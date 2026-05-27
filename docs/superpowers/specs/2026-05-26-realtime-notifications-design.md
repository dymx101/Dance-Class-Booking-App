# Design Spec: Real-time Notifications & Live Sync

**Date:** 2026-05-26
**Topic:** Real-time Member Communication - Production Phase 5
**Status:** Approved

## 1. Goal
Implement an in-app real-time notification system and live data synchronization for the "Dance-Class-Booking-App" using **Supabase Realtime**. This ensures members receive instant feedback for booking updates and see live availability on the schedule.

## 2. Architecture & Data Model

### 2.1 Database: `notifications` Table
- **Columns:** `id (UUID)`, `userId (UUID)`, `type (TEXT)`, `title (TEXT)`, `message (TEXT)`, `isRead (BOOL)`, `createdAt (TIMESTAMPTZ)`.
- **Types:** `waitlist_promoted`, `booking_confirmed`, `purchase_successful`, `class_cancelled`.
- **RLS:** Users can only `SELECT` and `UPDATE` (isRead) their own notifications.

### 2.2 Automation: Postgres Triggers
- **`on_waitlist_promotion`**: Fires when a booking status changes from 'waiting' to 'booked'. Inserts a record into the `notifications` table.
- **`on_purchase_fulfillment`**: Fires after a successful Stripe payment. Inserts a "Purchase Successful" notification.

## 3. Real-time Synchronization

### 3.1 Personal Notifications
The app will subscribe to the `notifications` table filtered by the current `auth.uid()`. New rows will trigger a "Live Toast" alert.

### 3.2 Global Schedule Sync
The app will subscribe to changes in the `bookings` table. When a booking is added or removed, the `bookedCount` on the frontend `ScheduleView` will update live without requiring a page refresh.

## 4. UI/UX Design

### 4.1 Notification Center
- Accessible via a bell icon in the Profile or Home view.
- Displays a chronological list of alerts with unread status indicators.
- "Mark all as read" functionality.

### 4.2 Live Toast Component
- Built with `motion/react` for smooth entry/exit.
- High-priority design (high contrast, icons).
- Automatically disappears after 5-8 seconds.

### 4.3 Unread Badge
- A red dot/number displayed on the navigation bar and profile to alert the user of new notifications.

## 5. Security
- **Scoped Subscriptions:** Realtime row-level security ensures users only receive events they are authorized to see.
- **Broadcast Limits:** Global schedule sync only broadcasts the count change, not specific user details.

## 6. Success Criteria
- User A cancels a spot; User B (waitlisted) receives a live toast saying they've been promoted.
- User C is browsing the schedule and sees a spot disappear live when User D books it.
- Unread count persists correctly across sessions.
