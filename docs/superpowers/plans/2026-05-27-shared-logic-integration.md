# Shared Logic Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the extraction of shared logic into `@dance-app/shared` and connect it to the web application.

**Architecture:** We use a monorepo structure where common types, mock data, and Supabase client logic live in `packages/shared`. The web app consumes these via the `@dance-app/shared` package.

**Tech Stack:** TypeScript, React, Vite, Supabase, tsup.

---

### Task 1: Fix `@dance-app/shared` Build

**Files:**
- Create: `packages/shared/tsconfig.json`
- Modify: `packages/shared/package.json`

- [ ] **Step 1: Create `packages/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ESNext", "DOM"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build -w @dance-app/shared`
Expected: `dist` folder populated with `index.js`, `index.mjs`, and `index.d.ts`.

---

### Task 2: Connect Web App to Shared Package

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/lib/supabase.ts`

- [ ] **Step 1: Add `@dance-app/shared` to `apps/web/package.json`**

```bash
# Add to dependencies
"@dance-app/shared": "*"
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

- [ ] **Step 3: Update `apps/web/src/lib/supabase.ts`**

```typescript
import { getSupabase } from '@dance-app/shared';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = getSupabase({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
});
```

---

### Task 3: Update Imports in Web App

**Files:**
- Modify: All files in `apps/web/src` importing from `./types`, `../types`, `./data`, `../data`.
- Delete: `apps/web/src/types.ts`
- Delete: `apps/web/src/data.ts`

- [ ] **Step 1: Replace imports in `apps/web/src`**

Search and replace:
- `import { ... } from './types'` -> `import { ... } from '@dance-app/shared'`
- `import { ... } from '../types'` -> `import { ... } from '@dance-app/shared'`
- `import { ... } from './data'` -> `import { ... } from '@dance-app/shared'`
- `import { ... } from '../data'` -> `import { ... } from '@dance-app/shared'`

- [ ] **Step 2: Delete redundant files**

Run: `rm apps/web/src/types.ts apps/web/src/data.ts`

---

### Task 4: Verify and Commit

- [ ] **Step 1: Run web build**

Run: `npm run build -w @dance-app/web`
Expected: Successful build.

- [ ] **Step 2: Commit changes**

```bash
git add .
git commit -m "feat(shared): complete extraction and integration of shared logic"
```
