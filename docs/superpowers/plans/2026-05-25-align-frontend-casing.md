# Align Frontend Casing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align property access in the Mini Program with database casing (lowercase).

**Architecture:** Update React components to use lowercase identifiers for Supabase result objects.

**Tech Stack:** Taro, React, TypeScript, Supabase.

---

### Task 1: Update Store Page Casing

**Files:**
- Modify: `apps/miniprogram/src/pages/store/index.tsx`

- [ ] **Step 1: Update `validDays` to `validdays`**
  - Replace `card.validDays` with `card.validdays` (lines 115, 172)
- [ ] **Step 2: Update `originalPrice` to `originalprice`**
  - Replace `card.originalPrice` with `card.originalprice` (lines 124, 125)
- [ ] **Step 3: Verify no other camelCase remains for database fields**
  - `remainingpasses` is already lowercase.
  - `price` and `passes` are already lowercase.
- [ ] **Step 4: Cleanup unused imports**
  - (Already checked, all seem used in store/index.tsx)

### Task 2: Update Schedule Page Casing & Cleanup

**Files:**
- Modify: `apps/miniprogram/src/pages/schedule/index.tsx`

- [ ] **Step 1: Cleanup unused imports**
  - Remove `Teacher` from `@dance-app/shared` import.
- [ ] **Step 2: Verify lowercase casing for results**
  - `bookedcount`, `maxcount`, `timestart`, `timeend` are already lowercase in this file.

### Task 3: Commit Changes

- [ ] **Step 1: Stage and amend commit**
  ```bash
  git add apps/miniprogram/src/pages/
  git commit --amend --no-edit
  ```
