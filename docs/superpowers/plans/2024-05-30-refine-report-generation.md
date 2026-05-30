# Refine Report Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix teacher performance data filtering to be period-specific and refactor the email template to use tables for Outlook compatibility.

**Architecture:** 
- Modify `index.ts` to perform filtered queries on `class_instances` and `bookings` instead of using the all-time view for teacher performance.
- Refactor `template.ts` to replace Flexbox/CSS Grid with nested `<table>` structures for maximum email client compatibility.

**Tech Stack:** TypeScript, Supabase (PostgreSQL), Deno (Supabase Functions).

---

### Task 1: Fix Data Filtering in index.ts

**Files:**
- Modify: `supabase/functions/generate-report/index.ts`

- [ ] **Step 1: Update Teacher Performance Query**
  - Calculate the `startDate` based on the `type` (Weekly: 7 days ago, Monthly: 30 days ago).
  - Query `class_instances` filtered by `date >= startDate`.
  - Query `bookings` for those instances.
  - Aggregate data in-function to calculate `total_bookings` and `avg_fill_rate` for the period.

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/generate-report/index.ts
git commit -m "fix(report): filter teacher performance by requested period"
```

### Task 2: Refactor HTML Template for Email Compatibility

**Files:**
- Modify: `supabase/functions/generate-report/template.ts`

- [ ] **Step 1: Replace Flexbox Layout with Tables**
  - Replace `.stat-grid` and `.stat-card` Flexbox layout with a `<table>` with `width="100%"`.
  - Ensure all layout-critical styling is inline or uses robust CSS.
  - Maintain the existing aesthetic but with table-based structure.

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/generate-report/template.ts
git commit -m "refactor(report): update email template to use tables for compatibility"
```

### Task 3: Verification

- [ ] **Step 1: Verify Code Integrity**
  - Check for any syntax errors or missing imports.
  - Ensure `totalBookings` is correctly calculated from the new `teacherData` structure.

- [ ] **Step 2: Final Commit --amend**

```bash
git add supabase/functions/generate-report/
git commit --amend --no-edit
```
