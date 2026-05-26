# Design Spec: Authentication Verification & Robustness (Approach 2)

**Date:** 2026-05-26  
**Status:** Approved  
**Topic:** Verification and refinement of the User Authentication implementation.

## 1. Overview
The goal is to verify the architectural consistency, security, and UX of the dance class booking app's authentication system. This includes improving the user lifecycle robustness and the login flow UX.

## 2. UI/UX Improvements
### 2.1 Resend SMS Countdown
- **Component:** `AuthScreen.tsx`
- **Feature:** Add a 60-second countdown after sending an SMS.
- **Behavior:**
  - Show "Resend code in Xs" while the timer is active.
  - Show "Resend code" button after the timer expires.
  - Clicking "Resend code" restarts the timer and calls `supabase.auth.signInWithOtp`.

### 2.2 User-Friendly Error Mapping
- **Feature:** Map technical Supabase/Postgres error messages to friendly strings.
- **Implementation:** Create a helper or a local map in `AuthScreen.tsx`.
- **Examples:**
  - `otp_expired` -> "The code has expired. Please request a new one."
  - `sms_limit_exceeded` -> "SMS limit reached. Please wait a few minutes before trying again."

## 3. Lifecycle Robustness
### 3.1 Fetch Profile Retry logic
- **Component:** `AuthContext.tsx`
- **Feature:** Add retry mechanism to `fetchProfile`.
- **Why:** The Postgres trigger (`auth.users` -> `public.users`) may have a slight latency. Retrying ensures the app doesn't show an "empty" profile immediately after login.
- **Strategy:** Exponential backoff or simple fixed delays (up to 3 retries).

## 4. Security & Verification
### 4.1 Trigger Validation
- **Action:** Create a verification script (or manual test steps) to ensure `auth.users` synchronization works for INSERT and UPDATE.
- **Deletion Policy:** Acknowledge that deletions are "Soft Delete" by default (the trigger does not delete data from `public.users`).

### 4.2 RLS Audit
- **Action:** Review all RLS policies in `20260526_initial_schema.sql`.
- **Checklist:**
  - `teachers`, `class_templates`, `class_instances`, `payment_cards`: Public Read.
  - `users`: Read/Update own profile.
  - `bookings`: Read/Insert own bookings.
  - `purchase_records`: Read own records.

## 5. Success Criteria
- [ ] User can log in via phone and OTP.
- [ ] Profile data is fetched reliably immediately after login.
- [ ] Error messages are clear and helpful.
- [ ] Resend countdown prevents spamming and improves UX.
- [ ] RLS policies protect user data from unauthorized access.
