# Finalize Web App Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the migration of web app imports to use `@dance-app/shared` and remove redundant local type/data files.

**Architecture:** Replace relative imports to `types.ts` and `data.ts` in `apps/web/src` with imports from the shared package `@dance-app/shared`.

**Tech Stack:** React, TypeScript, Turborepo

---

### Task 1: Update ScheduleView.tsx Imports

**Files:**
- Modify: `apps/web/src/components/ScheduleView.tsx`

- [ ] **Step 1: Update imports**

```typescript
// Replace relative imports with @dance-app/shared
import { DanceClass, Teacher, TEACHERS } from '@dance-app/shared';
```
*(Wait, I saw in the file that it was already using `@dance-app/shared`. Let me double check.)*

### Task 2: Update StoreView.tsx Imports

**Files:**
- Modify: `apps/web/src/components/StoreView.tsx`

- [ ] **Step 1: Update imports**

```typescript
import { PAYMENT_CARDS } from '@dance-app/shared';
import { PaymentCard, PurchaseRecord } from '@dance-app/shared';
```

### Task 3: Update AuthContext.tsx Imports

**Files:**
- Modify: `apps/web/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Update imports**

```typescript
import { User as Profile } from '@dance-app/shared';
```

### Task 4: Update NotificationContext.tsx Imports

**Files:**
- Modify: `apps/web/src/contexts/NotificationContext.tsx`

- [ ] **Step 1: Update imports**

```typescript
import { Notification } from '@dance-app/shared';
```

### Task 5: Update analytics.ts Imports

**Files:**
- Modify: `apps/web/src/lib/analytics.ts`

- [ ] **Step 1: Update imports**

```typescript
import { RevenueStat, TeacherPerformance, HeatmapData, MemberStat } from '@dance-app/shared';
```

### Task 6: Update App.tsx Imports

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Update imports**

```typescript
import { DanceClass, PurchaseRecord, AppTheme } from '@dance-app/shared';
import { generateClasses } from '@dance-app/shared';
```

### Task 7: Remove Redundant Files

**Files:**
- Delete: `apps/web/src/types.ts`
- Delete: `apps/web/src/data.ts`

- [ ] **Step 1: Delete types.ts**
- [ ] **Step 2: Delete data.ts**

### Task 8: Verify Build

- [ ] **Step 1: Run build**

Run: `npm run build -w @dance-app/web`
Expected: PASS

### Task 9: Commit Changes

- [ ] **Step 1: Commit**

```bash
git add .
git commit -m "feat(shared): final import migration and cleanup"
```
