# Design Doc: Shared Logic Extraction

**Goal:** Centralize types and Supabase client into a shared package (`@dance-app/shared`) to be used by both the web app and potential future platforms (like a Mini Program).

## Architecture

### 1. Shared Package (`packages/shared`)

- **`src/types.ts`**: Contains all shared interfaces (User, Teacher, DanceClass, Booking, etc.) currently in `apps/web/src/types.ts`.
- **`src/supabase.ts`**: Contains the `createSupabaseClient` factory function.
- **`src/mock-client.ts`**: Contains the mock Supabase client implementation and mock data generation logic (`generateClasses`).
- **`src/index.ts`**: Re-exports all types and the `createSupabaseClient` function.

### 2. Web App (`apps/web`)

- **`package.json`**: Updated to depend on `@dance-app/shared`.
- **`src/lib/supabase.ts`**: Refactored to initialize the singleton client using the shared factory.
- **Imports**: All local imports of types or the supabase client will be updated to point to `@dance-app/shared`.

## Implementation Details

### Supabase Factory Function
```typescript
export function createSupabaseClient(config: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}) {
  // Logic to either create a real client or return the mock client
}
```

### Mock Client
The mock client will be decoupled from Vite-specific globals and will live entirely within the shared package to ensure consistency across environments.

## Testing Strategy
- Run `npm run build` in `packages/shared`.
- Run `npm run lint` (tsc) in `apps/web` to ensure all types and imports are correct.
- Manual verification: Ensure the web app still functions correctly (auth, class listing).
