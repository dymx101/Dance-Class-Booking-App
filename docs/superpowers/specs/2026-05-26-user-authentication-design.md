# Design Spec: User Authentication (Phone & WeChat)

**Date:** 2026-05-26
**Topic:** User Authentication - Production Phase 2
**Status:** Approved

## 1. Goal
Implement a mobile-first authentication system for the "Dance-Class-Booking-App" to allow studio members to sign in securely, track their class passes, and manage their bookings.

## 2. Authentication Methods

### 2.1 Phone (SMS) Login - Primary
- **Provider:** Supabase Auth (Native SMS).
- **Flow:** 
  1. User enters mobile number (+86 support).
  2. Receives 6-digit OTP via SMS.
  3. Verifies OTP to establish a session.
- **Identity:** The phone number is the unique identifier linking to the `users` table.

### 2.2 WeChat Login - Shortcut
- **Provider:** Custom bridge via Supabase Edge Functions.
- **Flow:**
  1. User clicks "Login with WeChat".
  2. WeChat OAuth flow returns a `code`.
  3. Edge Function exchanges code for `openid` and signs in/up the user.

## 3. Data Strategy

### 3.1 User Synchronization
We will use a **Supabase Auth Hook** or a **Postgres Trigger** on the `auth.users` table to ensure that every authenticated user has a corresponding record in our public `users` table.

### 3.2 Schema Updates
- `users.id`: Primary Key (UUID) matching `auth.users.id`.
- `users.phone`: Unique identifier for SMS users.
- `users.wechat_openid`: Unique identifier for WeChat users.

## 4. UI/UX Components

### 4.1 AuthScreen / Modal
- A clean, high-contrast interface following the studio's branding.
- Support for multiple themes (Vibrant Light, Cool Mint, Midnight Cyber).
- Smooth transitions between phone entry and OTP entry using Framer Motion.

### 4.2 OTP Input
- A specialized 6-digit input component with auto-focus and paste support.

## 5. Security
- **RLS Policies:** 
  - Users can only read and update their own profile records.
  - Bookings are restricted to the authenticated user.
- **Rate Limiting:** Supabase Auth handles SMS rate limiting by default.

## 6. Success Criteria
- User can sign in with a phone number and receive an SMS code.
- User session persists across app restarts.
- New users are automatically created in the `users` table with default passes (e.g., 0 or a trial pass).
