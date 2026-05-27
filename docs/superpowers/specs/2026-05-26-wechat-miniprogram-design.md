# Design Spec: WeChat Mini Program (Taro) & Mono-repo Migration

**Date:** 2026-05-26
**Topic:** WeChat Integration - Production Phase 7
**Status:** Approved

## 1. Goal
Expand the "Dance-Class-Booking-App" to the WeChat ecosystem by implementing a native WeChat Mini Program using the **Taro** framework. The project will be restructured into a **Mono-repo** to share core business logic between the existing Web app and the new Mini Program.

## 2. Architecture: Mono-repo (pnpm/npm workspaces)
We will use a multi-package workspace to separate platform-specific UI from shared logic.

### 2.1 Directory Structure
- `apps/web/`: The existing React/Vite application.
- `apps/miniprogram/`: New Taro application (React-based) for WeChat.
- `packages/shared/`: Shared Supabase client, TypeScript interfaces, and business logic hooks.
- `packages/ui/`: Common Tailwind configurations and design tokens.

### 2.2 Shared Logic ("The Brain")
The following core modules will move to `packages/shared`:
- **Supabase Client**: Centralized connection singleton.
- **Auth Context**: Shared session management and user profiling.
- **Services**: Database fetching logic for classes, teachers, and analytics.

## 3. Mini Program Implementation (Taro)
- **Framework**: Taro 4 (React mode).
- **UI Components**: Re-implementing the high-contrast "PLAN A" design using Taro-native components (`<View>`, `<Text>`, `<Image>`).
- **Styling**: Shared Tailwind CSS config to ensure visual parity.

## 4. Authentication & Payments
- **Login**: Implement WeChat "Silent Login" using `Taro.login()` to retrieve an `openid`, mapped to the Supabase user profile.
- **Payments**: Placeholder for WeChat Pay (Native SDK). Note: Stripe is NOT used inside the native Mini Program.

## 5. Development Strategy (No AppID)
- **Local Development**: We will use the WeChat DevTools "Test Mode" with a Guest Account.
- **Simulators**: Taro's built-in H5 simulator for rapid UI iterations before testing in the actual Mini Program environment.

## 6. Success Criteria
- Existing Web app (`apps/web`) continues to function normally after logic extraction.
- New Mini Program (`apps/miniprogram`) launches in WeChat DevTools and connects to the same Supabase database.
- User can see the same schedule and profile data on both Web and WeChat.
