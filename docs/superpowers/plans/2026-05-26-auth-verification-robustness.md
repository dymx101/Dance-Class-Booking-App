# Auth Verification & Robustness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify and refine the authentication system for architectural consistency, security, and UX.

**Architecture:** 
- UI: React (Vite) + Supabase Auth.
- State: React Context for session and profile management.
- Backend: Supabase Postgres with a sync trigger and RLS.

**Tech Stack:** React, TypeScript, Supabase, Tailwind CSS, Vitest.

---

### Task 1: UI/UX Refinement in AuthScreen

**Files:**
- Modify: `src/components/auth/AuthScreen.tsx`

- [ ] **Step 1: Define Error Mapping**

Add an error map helper to translate technical Supabase errors.

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'otp_expired': '验证码已过期，请重新获取 (The code has expired. Please request a new one.)',
  'sms_limit_exceeded': '短信号码发送频繁，请稍后再试 (SMS limit reached. Please wait a few minutes before trying again.)',
  'invalid_otp': '验证码错误 (Invalid code. Please check and try again.)',
  'default': '操作失败，请重试 (Action failed, please try again.)'
};
```

- [ ] **Step 2: Add Resend Countdown State and Logic**

Add `resendTimer` and `canResend` states. Start timer after successful `signInWithOtp`.

```typescript
const [resendTimer, setResendTimer] = useState(0);

useEffect(() => {
  let interval: number;
  if (resendTimer > 0) {
    interval = window.setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [resendTimer]);

const startCountdown = () => setResendTimer(60);
```

- [ ] **Step 3: Update handleSendCode and handleVerifyCode**

Update error handling to use the map and trigger countdown.

```typescript
// In handleSendCode
try {
  const { error } = await supabase.auth.signInWithOtp({ phone: `+86${phone}` });
  if (error) throw error;
  setStep('otp');
  startCountdown();
} catch (err: any) {
  const msg = ERROR_MESSAGES[err.code] || ERROR_MESSAGES[err.message] || ERROR_MESSAGES.default;
  setError(msg);
}

// In handleVerifyCode
try {
  const { error } = await supabase.auth.verifyOtp({ phone: `+86${phone}`, token: otp, type: 'sms' });
  if (error) throw error;
} catch (err: any) {
  const msg = ERROR_MESSAGES[err.code] || ERROR_MESSAGES[err.message] || ERROR_MESSAGES.default;
  setError(msg);
  setLoading(false);
}
```

- [ ] **Step 4: Update UI for Countdown**

Add the resend UI below the verify button.

```tsx
<div className="text-center mt-4">
  {resendTimer > 0 ? (
    <p className="text-zinc-500 text-sm">
      重新获取验证码 ({resendTimer}s)
    </p>
  ) : (
    <button
      type="button"
      onClick={handleSendCode}
      className="text-white text-sm font-bold hover:underline cursor-pointer"
    >
      重新获取验证码 (Resend Code)
    </button>
  )}
</div>
```

- [ ] **Step 5: Commit changes**

```bash
git add src/components/auth/AuthScreen.tsx
git commit -m "feat(auth): add resend countdown and error mapping"
```

---

### Task 2: Robust Profile Fetching in AuthContext

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Add Retry Logic to fetchProfile**

Implement a retry loop with delay to handle Postgres trigger latency.

```typescript
const fetchProfile = async (userId: string, retries = 3) => {
  try {
    setLoading(true);
    let attempt = 0;
    let data = null;
    let error = null;

    while (attempt <= retries) {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      data = result.data;
      error = result.error;

      if (data) break;
      
      if (attempt < retries) {
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      } else {
        break;
      }
    }
    
    if (error && !data) {
      console.warn('Profile fetch result after retries:', error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    setProfile(null);
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 2: Commit changes**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "fix(auth): add retry logic to fetchProfile for trigger latency"
```

---

### Task 3: Verify User Sync Trigger

**Files:**
- Create: `src/verify-auth-trigger.test.ts`

- [ ] **Step 1: Create verification test**

Mocking or using a real test user if possible, but since we are in a CI/test environment, we'll write a manual verification script that can be run via `npm test` or `tsx`.

```typescript
import { supabase } from './lib/supabase';

// This is a conceptual test script for manual verification
async function verifyTrigger() {
  const testId = '00000000-0000-0000-0000-000000000000'; // Replace with a real test ID if needed
  console.log('Verifying trigger for ID:', testId);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', testId);
  
  if (error) console.error('Verification failed:', error.message);
  else console.log('Sync result:', data);
}
```

- [ ] **Step 2: Audit RLS Policies**

Manually check `supabase/migrations/20260526_initial_schema.sql` against the checklist:
- [ ] `teachers`: Public Read
- [ ] `class_templates`: Public Read
- [ ] `class_instances`: Public Read
- [ ] `payment_cards`: Public Read
- [ ] `users`: auth.uid() = id (Read/Update)
- [ ] `bookings`: auth.uid() = userId (Read/Insert)
- [ ] `purchase_records`: auth.uid() = userId (Read)

- [ ] **Step 3: Commit verification doc/script**

```bash
git add src/verify-auth-trigger.test.ts
git commit -m "test(auth): add auth sync verification script"
```
