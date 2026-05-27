# Design Spec: Booking Logic & Waitlist Management

**Date:** 2026-05-26
**Topic:** Booking Transactions - Production Phase 3
**Status:** Approved

## 1. Goal
Implement a robust, atomic booking system for the "Dance-Class-Booking-App" that handles pass validation, capacity checks, late cancellation policies, and automatic waitlist promotion using Supabase Postgres functions (RPC).

## 2. Server-Side Logic (Postgres RPC)

### 2.1 `book_class(p_instance_id UUID)`
This function will be called by the frontend to book a spot or join the waitlist.
- **Atomicity:** Wrapped in a single transaction.
- **Steps:**
  1. Verify the authenticated user has `remaining_passes > 0`.
  2. Check the `class_instances` current count vs `max_count`.
  3. **IF spot available:**
     - Insert into `bookings` with `status = 'booked'`.
     - Deduct 1 pass from `users.remaining_passes`.
  4. **ELSE (Class full):**
     - Calculate `next_queue_number` for the instance.
     - Insert into `bookings` with `status = 'waiting'` and the queue number.
     - (Optional) Freeze 1 pass from the user as per "Warm Tips".
- **Returns:** Success status or specific error code (`insufficient_passes`, `already_booked`).

### 2.2 `cancel_booking(p_booking_id UUID)`
- **Steps:**
  1. Verify booking ownership (`auth.uid() = user_id`).
  2. Calculate time difference between `now()` and `class_instances.start_time`.
  3. **IF > 1 hour remains:**
     - Delete the booking record.
     - Refund 1 pass to the user.
  4. **ELSE (Late cancellation):**
     - Update booking `status = 'no_show'`.
     - Do NOT refund the pass.
- **Returns:** Success status or error code (`late_cancellation`).

## 3. Automatic Waitlist Promotion
A Postgres trigger `after_booking_deleted` will monitor the `bookings` table.
- **Trigger Logic:**
  1. Identify the class instance associated with the deleted booking.
  2. Find the user in that instance's waitlist with the lowest `queue_number`.
  3. If found:
     - Change their status from `'waiting'` to `'booked'`.
     - (If passes weren't frozen earlier) Deduct their pass.
     - (Advanced) Send a notification (out of scope for this phase).

## 4. Frontend Integration (`ScheduleView.tsx`)
- Replace mock state manipulation (`handleBookingToggle`, `handleWaitlistToggle`) with Supabase RPC calls.
- Show clear loading states during the transaction.
- Display bilingual error messages for `late_cancellation` or `insufficient_passes`.

## 5. Security
- **RLS:** Users can only invoke functions that modify their own records.
- **Data Integrity:** Using database-level transactions ensures `bookedCount` always reflects the actual number of `'booked'` records.

## 6. Success Criteria
- A user cannot book a class if they have 0 passes.
- A class cannot exceed its `max_count`.
- If User A cancels a spot 2 hours before class, User B (first in waitlist) is automatically promoted.
- If User A cancels 30 minutes before class, they lose their pass and no one is promoted.
