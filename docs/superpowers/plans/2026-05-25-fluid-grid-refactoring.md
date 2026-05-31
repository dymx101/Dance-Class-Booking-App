# Fluid Grid Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor core views in the web app to use responsive grids for better layout on all screen sizes.

**Architecture:** Update Tailwind CSS classes in key component containers to use grid layouts with responsive breakpoints (`md`, `lg`, `xl`).

**Tech Stack:** React, Tailwind CSS.

---

### Task 1: Refactor ScheduleView Grid

**Files:**
- Modify: `apps/web/src/components/ScheduleView.tsx`

- [ ] **Step 1: Locate the class list container**

Find the `div` with `id="daily-classes-list"`.

- [ ] **Step 2: Update classes for responsiveness**

Change `className="space-y-3 mt-2"` to `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2"`.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2" id="daily-classes-list">
```

- [ ] **Step 3: Verify card layout**

Ensure individual cards inside the grid maintain their structure and look balanced.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/ScheduleView.tsx
git commit -m "feat(ui): refactor ScheduleView class list to responsive grid"
```

### Task 2: Refactor HomeView Grid and Banners

**Files:**
- Modify: `apps/web/src/components/HomeView.tsx`

- [ ] **Step 1: Update Banner height**

Locate `id="banner-carousel"` and update height classes.
Change `h-40` to `h-40 md:h-64 lg:h-80`.

```tsx
<div className="mt-3 relative h-40 md:h-64 lg:h-80 rounded-[28px] overflow-hidden shadow-2xl bg-[#141521] border border-white/5" id="banner-carousel">
```

- [ ] **Step 2: Update Video Showcase grid**

Locate `id="home-featured-videos"` container and update grid classes.
Change `grid grid-cols-2 gap-3` to `grid grid-cols-2 lg:grid-cols-4 gap-4`.

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

- [ ] **Step 3: Add desktop container constraints**

Wrap the main content in a container that limits width on very large screens.
Update the main `div` className to include `max-w-7xl mx-auto`.

```tsx
<div className={`flex-1 overflow-y-auto px-4 pb-20 pt-4 transition-colors duration-500 ${bgClass}`} id="home-view-container">
```
Change to:
```tsx
<div className={`flex-1 overflow-y-auto px-4 pb-20 pt-4 transition-colors duration-500 ${bgClass} max-w-7xl mx-auto w-full`} id="home-view-container">
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/HomeView.tsx
git commit -m "feat(ui): refactor HomeView banners and video grid for responsiveness"
```

### Task 3: Refactor StoreView Grid

**Files:**
- Modify: `apps/web/src/components/StoreView.tsx`

- [ ] **Step 1: Locate the membership card container**

Find the `div` with `id="passes-catalog"`.

- [ ] **Step 2: Update classes for responsiveness**

Change `className="mt-5 space-y-4"` to `className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"`.

```tsx
<div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="passes-catalog">
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/StoreView.tsx
git commit -m "feat(ui): refactor StoreView membership list to responsive grid"
```

### Task 4: Final Verification

- [ ] **Step 1: Run build to ensure no regressions**

Run: `cd apps/web && npm run build` (or similar build command if available)

- [ ] **Step 2: DONE**
