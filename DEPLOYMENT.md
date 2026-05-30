# Deployment & Testing Guide

## 1. Web Application (Production)

The web application is deployed to **Vercel**.

- **Production URL:** [https://dance-class-booking.vercel.app](https://dance-class-booking.vercel.app)
- **Deployment URL:** [https://dance-class-booking-8ys7sut1j-clap-cafe.vercel.app](https://dance-class-booking-8ys7sut1j-clap-cafe.vercel.app)

### 1.1 Demo Mode (Testing)
Since the production project is using placeholder Supabase credentials, the app automatically falls back to a **Mock Supabase Client**. This allows full functional testing without a real backend.

**To enter the app:**
1.  **Phone:** Any 11-digit number (e.g., `188 8888 8888`).
2.  **OTP:** Any 6-digit code (e.g., `000000`).

**To access Admin Dashboard:**
1.  Use a phone number containing `admin` or the specific number `13800000000`.
2.  Go to the **Profile (我的)** tab.
3.  Click the "Admin Panel" button.

### 1.2 Environment Variables
The following variables must be configured in the Vercel Dashboard for real Supabase connectivity:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 2. WeChat Mini Program

The Mini Program is developed using the **Taro** framework.

### 2.1 Local Testing
1.  Navigate to `apps/miniprogram`.
2.  Run `npm run dev:weapp`.
3.  Open the **WeChat DevTools**.
4.  Import the `apps/miniprogram` folder.
5.  Use "Test Mode" (Guest ID) if you don't have an official AppID.

---

## 3. Mono-repo Structure
This project uses **npm workspaces**.
- `apps/web`: React/Vite web application.
- `apps/miniprogram`: Taro WeChat Mini Program.
- `packages/shared`: Centralized business logic, types, and mock fallback client.
