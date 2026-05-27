# Mono-repo Workspace Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing monolithic structure into an npm workspaces mono-repo.

**Architecture:** 
- Root `package.json` as the workspace orchestrator.
- `apps/web` containing the React frontend.
- `packages/shared` and `packages/ui` as empty placeholders for future modularity.

**Tech Stack:** npm Workspaces, Vite, React, TypeScript.

---

### Task 1: Directory Scaffolding

**Files:**
- Create: `apps/web`
- Create: `packages/shared`
- Create: `packages/ui`

- [ ] **Step 1: Create the directory structure**

Run: `mkdir -p apps/web packages/shared packages/ui`

- [ ] **Step 2: Verify directories exist**

Run: `ls -d apps/web packages/shared packages/ui`
Expected: Directories listed.

- [ ] **Step 3: Commit empty directories (with .gitkeep if needed, or just proceed to move files)**

Run: `touch packages/shared/.gitkeep packages/ui/.gitkeep && git add apps packages && git commit -m "chore: scaffold monorepo directories"`

### Task 2: Migrate Web Application

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/web/tsconfig.json`
- Move: `src`, `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json` -> `apps/web/`

- [ ] **Step 1: Move files to apps/web**

Run: `mv src index.html vite.config.ts tsconfig.json package.json apps/web/`

- [ ] **Step 2: Update apps/web/package.json name**

Update name to `@dance-app/web` in `apps/web/package.json`.

- [ ] **Step 3: Update apps/web/tsconfig.json paths**

Ensure paths in `tsconfig.json` are still correct relative to the new location (usually they are `./`).

- [ ] **Step 4: Commit migration**

Run: `git add . && git commit -m "chore: migrate web app to apps/web"`

### Task 3: Initialize Root Workspace

**Files:**
- Create: `package.json` (Root)

- [ ] **Step 1: Create root package.json**

Create a new `package.json` in the root directory.

```json
{
  "name": "dance-class-booking-app",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "web:dev": "npm run dev -w @dance-app/web",
    "web:build": "npm run build -w @dance-app/web",
    "lint": "npm run lint -w @dance-app/web"
  }
}
```

- [ ] **Step 2: Run npm install**

Run: `npm install`
Expected: `node_modules` created in root, and `apps/web` dependencies linked.

- [ ] **Step 3: Commit root config**

Run: `git add package.json package-lock.json && git commit -m "chore: initialize workspace root"`

### Task 4: Verification

- [ ] **Step 1: Build the web app from root**

Run: `npm run web:build`
Expected: Build success.

- [ ] **Step 2: Final Commit**

Run: `git add . && git commit -m "chore: complete monorepo initialization"`
