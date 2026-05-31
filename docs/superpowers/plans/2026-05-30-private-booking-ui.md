# Private Booking Request Modal & Profile Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the booking request modal and integrate private coaching data with the user profile.

**Architecture:** Update `PrivateCoachingView` to include a modal for final booking confirmation and notes. Update `ProfileView` to fetch and display private coaching requests.

**Tech Stack:** React, Framer Motion, Lucide icons, Supabase RPC.

---

### Task 1: Update PrivateCoachingView with BookingRequestModal

**Files:**
- Modify: `apps/web/src/components/PrivateCoachingView.tsx`

- [ ] **Step 1: Add modal state and imports**
  Import `requestPrivateSession` from `../lib/coaching`. Add `isModalOpen` and `notes` state.
- [ ] **Step 2: Implement BookingRequestModal UI**
  Add a modal component that displays the booking summary and a textarea for notes. Use Framer Motion for animations.
- [ ] **Step 3: Update `handleBook` to use RPC**
  Modify `handleBook` to call `requestPrivateSession` and handle the loading/success states.
- [ ] **Step 4: Connect modal trigger**
  Update the "Confirm Booking" button to open the modal instead of calling `handleBook` directly.

### Task 2: Integrate Private Coaching in ProfileView

**Files:**
- Modify: `apps/web/src/components/ProfileView.tsx`

- [ ] **Step 1: Add private bookings state and fetching**
  Import `getUserPrivateBookings` and `PrivateBooking`. Add `privateBookings` state and fetch it in a `useEffect`.
- [ ] **Step 2: Add "Private Coaching" segment**
  Update `activeSegment` type and add the new tab to the navigation.
- [ ] **Step 3: Render private coaching list**
  Implement the rendering logic for the "Private Coaching" segment, showing instructor, date, time, and status.

### Task 3: Verification & Commit

- [ ] **Step 1: Run Lint/Typecheck**
  `npm run lint` or `tsc` to ensure no regressions.
- [ ] **Step 2: Commit changes**
  ```bash
  git add apps/web/src/components/
  git commit -m "feat(ui): add booking request modal and profile integration"
  ```
