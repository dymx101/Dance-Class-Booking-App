# Responsive UI Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the app into a fluid, responsive experience by removing the mobile bezel and adding adaptive navigation.

**Architecture:** Tailwind CSS for breakpoint management. Component-based sidebar and tabbar that show/hide based on screen width.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React.

---

### Task 1: Bezel Removal & App Container Cleanup

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Strip fixed dimensions**
Remove `max-w-[412px]`, `h-[860px]`, `rounded-[48px]`, and `border-[12px]` from the main inner container.

- [ ] **Step 2: Remove notch/status bar**
Delete the `emulator-notching-bar` div and related mock mobile status elements.

- [ ] **Step 3: Update outer background**
Change the outer background container to be the global app background (no more "sand" margins).

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/App.tsx
git commit -m "feat(ui): remove simulated mobile phone bezel and notch"
```

---

### Task 2: Responsive Sidebar Navigation

**Files:**
- Create: `apps/web/src/components/Navigation.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Implement Responsive Navigation Component**
Create a component that renders a **Sidebar** on `md` screens and the existing **TabBar** on smaller screens.

- [ ] **Step 2: Update App Layout**
Refactor the main `return` block in `App.tsx` to use a `flex` row for the Sidebar + Content layout.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/Navigation.tsx apps/web/src/App.tsx
git commit -m "feat(ui): implement responsive sidebar and tabbar navigation"
```

---

### Task 3: Fluid Grid Refactoring

**Files:**
- Modify: `apps/web/src/components/ScheduleView.tsx`
- Modify: `apps/web/src/components/HomeView.tsx`

- [ ] **Step 1: Update ScheduleView Grid**
Change the class card listing to use a responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

- [ ] **Step 2: Update HomeView Layout**
Ensure banners and featured sections fill the wider screen correctly on desktop.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/ScheduleView.tsx apps/web/src/components/HomeView.tsx
git commit -m "feat(ui): refactor content grids for fluid responsiveness"
```

---

### Task 4: Final Polish & Breakpoint Testing

**Files:**
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Clean up global paddings**
Ensure containers have appropriate horizontal padding (`px-4 md:px-8 lg:px-12`) for larger screens.

- [ ] **Step 2: Verify all breakpoints**
Check Mobile, Tablet (Portrait/Landscape), and Desktop views.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "style: final responsive polish and layout fixes"
```
