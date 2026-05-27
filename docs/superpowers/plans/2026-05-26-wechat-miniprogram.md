# WeChat Mini Program & Mono-repo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the project into a Mono-repo and bootstrap a Taro-based WeChat Mini Program.

**Architecture:** npm workspaces with a `shared` package for logic and `web` / `miniprogram` apps for platform-specific UI.

**Tech Stack:** npm, Taro 4, React 19, Supabase, Tailwind CSS.

---

### Task 1: Mono-repo Workspace Initialization

**Files:**
- Modify: `package.json` (root)
- Create: `apps/web/package.json`

- [ ] **Step 1: Configure npm workspaces in root package.json**
Add the `workspaces` field to the root `package.json`.

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

- [ ] **Step 2: Restructure directory**
Move existing files to `apps/web`.

```bash
mkdir -p apps/web packages/shared packages/ui
# Move src, public, package.json, etc. to apps/web (logic will be extracted later)
```

- [ ] **Step 3: Commit**
```bash
git add pnpm-workspace.yaml apps/web packages
git commit -m "chore: initialize mono-repo workspace"
```

---

### Task 2: Shared Logic Extraction

**Files:**
- Create: `packages/shared/src/supabase.ts`
- Create: `packages/shared/src/types.ts`
- Modify: `apps/web/src/lib/supabase.ts`

- [ ] **Step 1: Move Supabase client and Types**
Extract the connection singleton and TS interfaces to `packages/shared`.

- [ ] **Step 2: Link shared package to web app**
Update `apps/web/package.json` to include `"@plana/shared": "workspace:*"` and update imports.

- [ ] **Step 3: Commit**
```bash
git add packages/shared apps/web
git commit -m "feat(shared): extract core logic and types to shared package"
```

---

### Task 3: Bootstrap Taro Mini Program

**Files:**
- Create: `apps/miniprogram/package.json`
- Create: `apps/miniprogram/src/app.tsx`

- [ ] **Step 1: Scaffold Taro project**
Use Taro CLI (or manual setup) to create the `apps/miniprogram` structure.

- [ ] **Step 2: Connect Shared Logic**
Import `@plana/shared` into the Taro app and verify Supabase connection.

- [ ] **Step 3: Commit**
```bash
git add apps/miniprogram
git commit -m "feat(mp): bootstrap taro mini program project"
```

---

### Task 4: UI/UX Parity (Home & Schedule)

**Files:**
- Create: `apps/miniprogram/src/pages/index/index.tsx`
- Create: `apps/miniprogram/src/pages/schedule/index.tsx`

- [ ] **Step 1: Re-implement HomeView for MP**
Translate `HomeView.tsx` to Taro components (`<View>`, `<Text>`).

- [ ] **Step 2: Re-implement ScheduleView for MP**
Translate `ScheduleView.tsx` and connect to the shared booking services.

- [ ] **Step 3: Commit**
```bash
git add apps/miniprogram/src/pages
git commit -m "feat(mp): implement home and schedule views in taro"
```

---

### Task 5: WeChat Silent Login Integration

**Files:**
- Modify: `packages/shared/src/auth.ts`
- Modify: `apps/miniprogram/src/app.tsx`

- [ ] **Step 1: Implement WeChat login bridge**
Add a method to the shared auth service that takes a WeChat `code` and calls the Supabase `openid` exchange function.

- [ ] **Step 2: Auto-login on Launch**
In the Taro `app.tsx`, call `Taro.login()` and perform the silent auth.

- [ ] **Step 3: Commit**
```bash
git add packages/shared apps/miniprogram
git commit -m "feat(auth): implement wechat silent login bridge"
```
