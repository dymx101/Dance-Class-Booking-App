# Align Types and Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align shared TypeScript interfaces, database schema, and UI components to use consistent lowercase identifiers to match Supabase defaults and ensure data integrity.

**Architecture:** Update `packages/shared` types to lowercase, synchronize the Supabase migration, and update all property references in Web and MiniProgram applications.

**Tech Stack:** TypeScript, Supabase (PostgreSQL), React, Taro (MiniProgram).

---

### Task 1: Update Shared Types

**Files:**
- Modify: `packages/shared/src/types.ts`

- [ ] **Step 1: Update User interface**
  - Change `remainingPasses` to `remainingpasses`
  - Change `experiencePoints` to `experiencepoints`
  - Change `totalClassesJoined` to `totalclassesjoined`
  - Change `favoriteStyle` to `favoritestyle`
  - Change `streakDays` to `streakdays`

- [ ] **Step 2: Update DanceClass interface**
  - Change `timeStart` to `timestart`
  - Change `timeEnd` to `timeend`
  - Change `minPeople` to `minpeople`
  - Change `bookedCount` to `bookedcount`
  - Change `maxCount` to `maxcount`
  - Change `openBookingTime` to `openbookingtime`
  - Change `reservedSpots` to `reservedspots`

- [ ] **Step 3: Update Booking interface**
  - Change `classId` to `classid`
  - Change `userId` to `userid`
  - Change `queueNumber` to `queuenumber`

- [ ] **Step 4: Update PaymentCard interface**
  - Change `originalPrice` to `originalprice`
  - Change `validDays` to `validdays`

- [ ] **Step 5: Update PurchaseRecord interface**
  - Change `cardId` to `cardid`
  - Change `cardName` to `cardname`
  - Change `passesAdded` to `passesadded`
  - Change `stripePaymentId` to `stripepaymentid`

- [ ] **Step 6: Update ClassTemplate interface**
  - Change `dayOfWeek` to `dayofweek`
  - Change `timeStart` to `timestart`
  - Change `timeEnd` to `timeend`
  - Change `teacherId` to `teacherid`
  - Change `minPeople` to `minpeople`
  - Change `maxCount` to `maxcount`
  - Change `isActive` to `isactive`

- [ ] **Step 7: Commit**
  ```bash
  git add packages/shared/src/types.ts
  git commit -m "refactor(shared): change type properties to lowercase to match DB"
  ```

### Task 2: Update Mock Data and Client

**Files:**
- Modify: `packages/shared/src/mock-data.ts`
- Modify: `packages/shared/src/mock-client.ts`

- [ ] **Step 1: Update `packages/shared/src/mock-data.ts`**
  - Update all `CLASSES_TEMPLATE` and `PAYMENT_CARDS` objects to use lowercase keys.
  - Update `generateClasses` function to use lowercase keys.

- [ ] **Step 2: Update `packages/shared/src/mock-client.ts`**
  - Update any references to properties (e.g., in `bookClass`, `cancelBooking`) to use lowercase.

- [ ] **Step 3: Commit**
  ```bash
  git add packages/shared/src/mock-data.ts packages/shared/src/mock-client.ts
  git commit -m "refactor(shared): update mock data to use lowercase properties"
  ```

### Task 3: Update Database Schema

**Files:**
- Modify: `supabase/migrations/20260526_initial_schema.sql`

- [ ] **Step 1: Add `bookedcount` to `class_instances` table**
  - Add `bookedcount INTEGER DEFAULT 0` to the `CREATE TABLE class_instances` block.

- [ ] **Step 2: Commit**
  ```bash
  git add supabase/migrations/20260526_initial_schema.sql
  git commit -m "fix(db): add bookedcount to class_instances table"
  ```

### Task 4: Update Web Components

**Files:**
- Modify: `apps/web/src/components/ScheduleView.tsx`
- Modify: `apps/web/src/components/StoreView.tsx`
- Modify: `apps/web/src/components/ProfileView.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Update `apps/web/src/components/ScheduleView.tsx`**
  - Replace all camelCase property usages with lowercase.

- [ ] **Step 2: Update `apps/web/src/components/StoreView.tsx`**
  - Replace all camelCase property usages with lowercase.

- [ ] **Step 3: Update `apps/web/src/components/ProfileView.tsx`**
  - Replace all camelCase property usages with lowercase.

- [ ] **Step 4: Update `apps/web/src/App.tsx`**
  - Replace all camelCase property usages with lowercase.

- [ ] **Step 5: Commit**
  ```bash
  git add apps/web/src/components/ScheduleView.tsx apps/web/src/components/StoreView.tsx apps/web/src/components/ProfileView.tsx apps/web/src/App.tsx
  git commit -m "refactor(web): update component property references to lowercase"
  ```

### Task 5: Update MiniProgram Pages (Verification and Completion)

**Files:**
- Modify: `apps/miniprogram/src/pages/store/index.tsx` (if needed)
- Modify: `apps/miniprogram/src/pages/home/index.tsx` (if needed)

- [ ] **Step 1: Verify `apps/miniprogram/src/pages/schedule/index.tsx`**
  - Already seems partially lowercase, ensure full consistency.

- [ ] **Step 2: Update `apps/miniprogram/src/pages/store/index.tsx`**
  - Ensure all properties use lowercase.

- [ ] **Step 3: Commit**
  ```bash
  git add apps/miniprogram/src/pages/store/index.tsx
  git commit -m "refactor(mp): ensure lowercase property consistency"
  ```
