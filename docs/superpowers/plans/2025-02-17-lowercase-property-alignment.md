# Final Lowercase Property Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align property names to lowercase across Web and Miniprogram applications to match the shared types and database schema.

**Architecture:** Update React components and Supabase data fetching logic to use lowercase property names (e.g., `remainingpasses` instead of `remainingPasses`).

**Tech Stack:** React, TypeScript, Supabase, Taro (Miniprogram).

---

### Task 1: Update `apps/web/src/components/ProfileView.tsx`

**Files:**
- Modify: `apps/web/src/components/ProfileView.tsx`

- [ ] **Step 1: Update properties in `handleCancelBooking` and rendering**
  - Change `cls.timestart` and `cls.timeend` (ensure they are lowercase).
  - Change `c.bookedcount` (ensure it's lowercase).
  - Change `profile?.remainingpasses` (ensure it's lowercase).
  - Change `cls.reservedSpots` to `cls.reservedspots`.

### Task 2: Update `apps/web/src/App.tsx`

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Update Supabase query and data mapping in `fetchClassesAndBookings`**
  - Change `.select('remainingPasses')` to `.select('remainingpasses')`.
  - Change `userData.remainingPasses` to `userData.remainingpasses`.
  - Change `userId` to `userid`.
  - Change `classId` to `classid`.
  - Change `spotNumber` to `spotnumber`.
  - Update `PurchaseRecord` mapping: `cardid`, `cardname`, `passesadded`, `stripepaymentid`.
  - Update `DanceClass` mapping: `timestart`, `timeend`, `bookedcount`, `reservedspots`.
  - Update `profile.remainingPasses` usage to `profile.remainingpasses`.

### Task 3: Update `apps/miniprogram/src/pages/home/index.tsx`

**Files:**
- Modify: `apps/miniprogram/src/pages/home/index.tsx`

- [ ] **Step 1: Verify and align data access**
  - Ensure `teacher.tags` and `teacher.name` are used correctly (they already seem to be, but check against shared types).
  - Check if any other properties like `timestart` or `timeend` are used and need lowercasing.

### Task 4: Final Verification and Commit

- [ ] **Step 1: Run a grep to ensure no camelCase versions remain for these specific properties**
  - `grep -r "remainingPasses" apps/web/src`
  - `grep -r "timeStart" apps/web/src`
  - `grep -r "timeEnd" apps/web/src`
  - `grep -r "bookedCount" apps/web/src`
- [ ] **Step 2: Commit changes**
  - `git add . && git commit -m "fix(stabilization): final alignment of lowercase properties"`
