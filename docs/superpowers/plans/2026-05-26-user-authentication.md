# User Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement verified Phone (SMS) and WeChat authentication using Supabase.

**Architecture:** Supabase Auth for session management, linked to a public `users` table via Postgres triggers. React-based UI with Framer Motion transitions.

**Tech Stack:** React 19, Supabase Auth, Postgres, Tailwind CSS, motion/react.

---

### Task 1: User Synchronization & Database Prep

**Files:**
- Create: `supabase/migrations/20260526_user_sync_trigger.sql`

- [ ] **Step 1: Create Postgres trigger for user sync**
Write a migration that creates a function and trigger to automatically insert a record into `public.users` when a new user signs up in `auth.users`.

```sql
-- supabase/migrations/20260526_user_sync_trigger.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, avatar)
  VALUES (NEW.id, NEW.phone, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260526_user_sync_trigger.sql
git commit -m "feat: add postgres trigger for user synchronization"
```

---

### Task 2: Auth State Management & Context

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create AuthProvider**
Implement a context provider that tracks the Supabase session and user profile.

- [ ] **Step 2: Wrap App with AuthProvider**
Inject the provider into the main component tree.

- [ ] **Step 3: Commit**
```bash
git add src/contexts/AuthContext.tsx src/App.tsx
git commit -m "feat: add AuthContext for session management"
```

---

### Task 3: Phone Auth UI (Entry & OTP)

**Files:**
- Create: `src/components/auth/AuthScreen.tsx`
- Create: `src/components/auth/OTPInput.tsx`

- [ ] **Step 1: Build OTPInput component**
Implement a 6-digit verification code input with auto-focus logic.

- [ ] **Step 2: Build AuthScreen**
Create the main login UI with Phone Entry and OTP Entry views, including Framer Motion animations.

- [ ] **Step 3: Connect to Supabase Auth**
Implement `signInWithOtp` and `verifyOtp` calls.

- [ ] **Step 4: Commit**
```bash
git add src/components/auth/AuthScreen.tsx src/components/auth/OTPInput.tsx
git commit -m "feat: implement phone authentication UI and logic"
```

---

### Task 4: Profile Integration & Final Polish

**Files:**
- Modify: `src/components/ProfileView.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Connect Profile to Auth**
Update the Profile view to show real user data from the database and handle logout.

- [ ] **Step 2: Guard Protected Routes**
Ensure the Admin Dashboard and Bookings require an active session.

- [ ] **Step 3: Commit**
```bash
git add src/components/ProfileView.tsx src/App.tsx
git commit -m "feat: integrate auth into profile and protect routes"
```
