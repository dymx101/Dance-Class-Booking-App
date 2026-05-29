# Shared Logic Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize types and Supabase client into the `@dance-app/shared` package.

**Architecture:** Create a flexible Supabase client factory and shared types in `packages/shared`. Update `apps/web` to depend on `@dance-app/shared`.

**Tech Stack:** TypeScript, Supabase, tsup, Vite.

---

### Task 1: Initialize Shared Package Dependencies

**Files:**
- Modify: `packages/shared/package.json`

- [ ] **Step 1: Add supabase-js dependency to shared package**

```bash
npm install @supabase/supabase-js -w @dance-app/shared
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/package.json
git commit -m "chore(shared): add supabase-js dependency"
```

### Task 2: Port Types to Shared Package

**Files:**
- Create: `packages/shared/src/types.ts`

- [ ] **Step 1: Copy types from web app to shared**
- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat(shared): add shared types"
```

### Task 3: Port Mock Client to Shared Package

**Files:**
- Create: `packages/shared/src/mock-client.ts`

- [ ] **Step 1: Move mock client logic and generateClasses to shared**
- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/mock-client.ts
git commit -m "feat(shared): add mock supabase client"
```

### Task 4: Create Supabase Factory in Shared Package

**Files:**
- Create: `packages/shared/src/supabase.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Implement createSupabaseClient factory**
- [ ] **Step 2: Export everything from index.ts**
- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/supabase.ts packages/shared/src/index.ts
git commit -m "feat(shared): add supabase factory and index exports"
```

### Task 5: Build Shared Package

- [ ] **Step 1: Run build command**

```bash
npm run shared:build
```

- [ ] **Step 2: Commit dist (if not gitignored)**
Wait, usually dist is gitignored. Let's check .gitignore.

### Task 6: Update Web App Dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Add @dance-app/shared dependency**
- [ ] **Step 2: Run npm install**
- [ ] **Step 3: Commit**

### Task 7: Update Web App Supabase Initialization

**Files:**
- Modify: `apps/web/src/lib/supabase.ts`

- [ ] **Step 1: Use shared factory**
- [ ] **Step 2: Commit**

### Task 8: Update Web App Imports

- [ ] **Step 1: Replace local type imports with @dance-app/shared**
- [ ] **Step 2: Verify build and lint**
- [ ] **Step 3: Commit**
