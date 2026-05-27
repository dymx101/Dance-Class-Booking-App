# Mono-repo Workspace Initialization Design

**Goal:** Restructure the Dance-Class-Booking-App into an npm workspaces mono-repo to support multi-platform development (e.g., adding a mobile app or shared packages).

**Architecture:**
- Root: Workspace manager using npm workspaces.
- `apps/web`: Existing React/Vite application.
- `packages/shared`: Shared business logic and utilities.
- `packages/ui`: Shared UI components.

**Proposed Changes:**
1.  **Directory Structure:**
    ```
    /
    ├── apps/
    │   └── web/
    ├── packages/
    │   ├── shared/
    │   └── ui/
    ├── package.json (Workspace Root)
    └── ... (docs, supabase, .git, etc.)
    ```

2.  **File Migrations:**
    - Move `src`, `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json` to `apps/web/`.
    - Update `apps/web/package.json` name to `@dance-app/web`.

3.  **Root Configuration:**
    - Root `package.json` will contain:
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

4.  **Validation:**
    - Run `npm install` at root.
    - Run `npm run web:build` to ensure the web app still compiles.

**Success Criteria:**
- Project structure matches the proposal.
- `npm install` works without errors.
- Web application builds and runs as before.
