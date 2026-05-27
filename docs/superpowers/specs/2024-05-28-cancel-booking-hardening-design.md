# Design Doc: Final Hardening of cancel_booking RPC

## Problem Statement
The current `cancel_booking` RPC function lacks sufficient locking, which could lead to overbooking during concurrent cancellations and promotions from the waitlist. Additionally, user pass refunds need consistent locking to prevent race conditions.

## Goals
- Ensure full atomicity of the cancellation and promotion transaction.
- Prevent overbooking by locking the `class_instances` record.
- Secure user pass updates by locking the `users` record.

## Proposed Changes

### 1. Update `cancel_booking` in `supabase/migrations/20260526_booking_rpc.sql`

#### Locking Strategy:
1.  **Lock Booking:** (Already exists) `SELECT ... FROM bookings WHERE id = p_booking_id FOR UPDATE`.
2.  **Lock Class Instance:** `SELECT ... FROM class_instances WHERE id = v_booking_record."classId" FOR UPDATE`. This prevents concurrent promotions from overfilling the class if `book_class` is also running or if another cancellation is happening.
3.  **Lock User:** `SELECT id FROM users WHERE id = v_user_id FOR UPDATE`. This ensures the pass refund is atomic.

#### Refined Logic in `cancel_booking`:
- Lock the booking record first.
- Lock the class instance record.
- Lock the user record.
- Perform the refund/cancellation logic.
- If a spot opens up in a 'booked' state (not waiting), find the next person on the waitlist and promote them.

## Verification Plan
- **Static Analysis:** Ensure `FOR UPDATE` is used on all records that are subsequently updated or whose state affects the outcome of the transaction.
- **Transaction Isolation:** Verify that the order of locking is consistent (e.g., always `users` then `class_instances` if both are needed, or similar) to avoid deadlocks. 
    - *Note:* `book_class` locks `users` then `class_instances`. We should follow the same order in `cancel_booking`.

## Security Considerations
- `SECURITY DEFINER` is used, so we must ensure `auth.uid()` check is robust.
- RLS is bypassed by `SECURITY DEFINER`, but the function explicitly checks `v_booking_record."userId" != v_user_id`.
