# Final Responsive Polish & Layout Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the responsive layout is polished and bug-free across all devices, following the specified padding and transition requirements.

**Architecture:** Update main view containers to use responsive horizontal padding. Refine admin layout for better mobile/tablet support. Adjust z-indexes and transitions for navigation components.

**Tech Stack:** React, TailwindCSS, Lucide Icons, Framer Motion (motion/react).

---

### Task 1: Update Horizontal Padding in Main Views

**Files:**
- Modify: `apps/web/src/components/HomeView.tsx`
- Modify: `apps/web/src/components/ScheduleView.tsx`
- Modify: `apps/web/src/components/StoreView.tsx`
- Modify: `apps/web/src/components/ProfileView.tsx`

- [ ] **Step 1: Update `HomeView.tsx` padding**
    Update the container div to use `px-4 md:px-8 lg:px-12`.
- [ ] **Step 2: Update `ScheduleView.tsx` padding**
    Update the container div to use `px-4 md:px-8 lg:px-12`.
- [ ] **Step 3: Update `StoreView.tsx` padding**
    Update the container div to use `px-4 md:px-8 lg:px-12`.
- [ ] **Step 4: Update `ProfileView.tsx` padding**
    Update the container div to use `px-4 md:px-8 lg:px-12`.

### Task 2: Polish Admin Dashboard Responsiveness

**Files:**
- Modify: `apps/web/src/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Make `AdminLayout.tsx` responsive**
    - Change `aside` to be hidden on mobile (`hidden md:flex`).
    - Add a mobile header or toggle for the sidebar in Admin mode.
    - Update `header` and `main` padding to `px-4 md:px-8 lg:px-12`.

### Task 3: Refine Navigation Transitions & Z-Index

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/Navigation.tsx`

- [ ] **Step 1: Update `App.tsx` layout**
    - Ensure the top theme switcher bar follows responsive padding `px-4 md:px-8 lg:px-12`.
- [ ] **Step 2: Refine `Navigation.tsx`**
    - Verify breakpoints and smooth transition.

### Task 4: Commit Changes

- [ ] **Step 1: Run build to verify no regressions**
- [ ] **Step 2: Commit**
