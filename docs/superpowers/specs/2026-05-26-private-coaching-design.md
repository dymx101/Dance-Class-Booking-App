# Design Spec: Private Coaching Booking (Phase 2)

**Date:** 2026-05-26
**Topic:** Premium 1-on-1 Sessions
**Status:** Approved

## 1. Goal
Implement a premium on-demand private coaching system for the "Dance-Class-Booking-App". Members should be able to browse instructors, view their availability, and request 1-on-1 sessions using a dedicated "Private Pass" wallet.

## 2. Architecture & Data Model

### 2.1 Database Schema
- **`teacher_availability`**: Stores recurring work hours for instructors.
  - `teacher_id (UUID)`, `day_of_week (INT)`, `start_time (TIME)`, `end_time (TIME)`.
- **`private_bookings`**: Manages on-demand session requests.
  - `id (UUID)`, `user_id (UUID)`, `teacher_id (UUID)`, `scheduled_at (TIMESTAMPTZ)`, `status (TEXT)`, `notes (TEXT)`.
- **`users` (Extended)**: 
  - Add `privatepasses (INT)` column for dedicated premium session tracking.

### 2.2 Business Rules
- **Validation**: Members must have `privatepasses > 0` to request a session.
- **Availability**: Users can only select times within the instructor's defined availability window.
- **Workflow**: Requests are set to `status = 'requested'` on creation and must be `confirmed` by an admin or teacher (future scope).

## 3. UI/UX Design

### 3.1 Teacher-First Flow
- A dedicated view/tab for Private Coaching.
- **Teacher Cards**: Detailed profiles with specific "Available Today" indicators.
- **Availability Grid**: An interactive picker showing available time slots for the selected instructor.
- **Request Modal**: Form for confirming the date/time and adding personal training goals/notes.

### 3.2 Premium Aesthetic
- High-contrast branding with subtle gradients and fluid animations (`motion/react`).
- Full support for the app's multi-theme system (`Vibrant Light`, `Cool Mint`, `Midnight Cyber`).

## 4. Security & RBAC
- **RLS**: 
  - Users can only `SELECT` and `INSERT` their own private bookings.
  - Teachers can `SELECT` bookings assigned to them.
- **RPC**: Create a `request_private_session` function to atomically check passes and insert the request.

## 5. Success Criteria
- Member can successfully request a private session with a specific teacher.
- The request correctly deducts 1 `privatepass` from the user's account.
- The instructor's availability is accurately reflected in the UI.
