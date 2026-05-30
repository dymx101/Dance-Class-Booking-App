# Project Instructions

## 1. Environment & Deployment
- **Web App**: Deployed to Vercel at [https://dance-class-booking.vercel.app](https://dance-class-booking.vercel.app).
- **Demo Mode**: The project automatically falls back to a **Mock Supabase Client** if placeholder credentials (`your-project.supabase.co`) are detected in the environment.
- **Testing**: Use any phone number and any 6-digit code to test the authenticated experience in the web deployment.

## 2. Architecture (Mono-repo)
- This project uses **npm workspaces**.
- All business logic, Supabase client logic, and TypeScript types reside in `packages/shared`.
- UI applications are located in `apps/`.
- Standardized identifiers: All database-mapped properties must use **lowercase** (e.g., `remainingpasses`, `bookedcount`) to maintain parity with the PostgreSQL schema.

## 3. Technology Stack
- **Web**: React 19 + Vite + Tailwind CSS.
- **Mini Program**: Taro 4 (React mode).
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime).
- **Payments**: Stripe (Web) and WeChat Pay V3 (Mini Program).
- **Notifications**: Supabase Realtime + Postgres Triggers.
