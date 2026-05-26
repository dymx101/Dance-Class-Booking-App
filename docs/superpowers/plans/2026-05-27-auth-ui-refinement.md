# Auth UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve user feedback with bilingual error mapping and a 60-second SMS resend countdown.

**Architecture:** Centralized error mapping object and React `useState`/`useEffect` hooks for timer management.

**Tech Stack:** React, Supabase Auth, Lucide React, Motion.

---

### Task 1: Define Error Mapping and Initial State

**Files:**
- Modify: `src/components/auth/AuthScreen.tsx`

- [ ] **Step 1: Define the `AUTH_ERRORS` mapping constant**

Add this constant outside the `AuthScreen` component:
```typescript
const AUTH_ERRORS: Record<string, { en: string; zh: string }> = {
  'invalid_credentials': {
    en: 'Invalid or expired code. Please try again.',
    zh: '验证码无效或已过期，请重试。'
  },
  'too_many_requests': {
    en: 'Too many requests. Please wait before trying again.',
    zh: '请求过多，请稍后再试。'
  },
  'otp_expired': {
    en: 'OTP has expired. Please request a new one.',
    zh: '验证码已过期，请重新获取。'
  },
  'user_not_found': {
    en: 'User not found.',
    zh: '未找到用户。'
  },
  'default': {
    en: 'An error occurred. Please try again.',
    zh: '发生错误，请重试。'
  }
};
```

- [ ] **Step 2: Add `countdown` state to `AuthScreen`**

```typescript
const [countdown, setCountdown] = useState(0);
```

- [ ] **Step 3: Commit initial state**

```bash
git add src/components/auth/AuthScreen.tsx
git commit -m "feat(auth): add AUTH_ERRORS mapping and countdown state"
```

### Task 2: Implement Countdown Timer Logic

**Files:**
- Modify: `src/components/auth/AuthScreen.tsx`

- [ ] **Step 1: Implement `useEffect` for the timer**

```typescript
  React.useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);
```

- [ ] **Step 2: Start countdown on SMS send**

Update `handleSendCode`:
```typescript
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+86${phone}`,
      });
      if (error) throw error;
      setStep('otp');
      setCountdown(60); // Start 60s countdown
    } catch (err: any) {
      // Error handling will be updated in Task 3
    }
```

- [ ] **Step 3: Commit timer logic**

```bash
git add src/components/auth/AuthScreen.tsx
git commit -m "feat(auth): implement countdown timer logic"
```

### Task 3: Update Error Handling with Mapping

**Files:**
- Modify: `src/components/auth/AuthScreen.tsx`

- [ ] **Step 1: Helper function to get error message**

```typescript
  const getErrorMessage = (err: any) => {
    const code = err.code || err.message?.toLowerCase().replace(/ /g, '_');
    const mapping = AUTH_ERRORS[code] || AUTH_ERRORS['default'];
    return `${mapping.en} / ${mapping.zh}`;
  };
```

- [ ] **Step 2: Update `handleSendCode` and `handleVerifyCode` catch blocks**

```typescript
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
```

- [ ] **Step 3: Commit error mapping**

```bash
git add src/components/auth/AuthScreen.tsx
git commit -m "feat(auth): use bilingual error mapping"
```

### Task 4: Update UI with Countdown and Resend Button

**Files:**
- Modify: `src/components/auth/AuthScreen.tsx`

- [ ] **Step 1: Update OTP step UI to show countdown**

Replace the Verify Code description section or add below it:
```tsx
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">Verify Code</h2>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-zinc-400">Sent to +86 {phone}</p>
                      {countdown > 0 ? (
                        <p className="text-xs text-zinc-500 font-medium">Resend in {countdown}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendCode}
                          className="text-xs text-white font-bold hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
```

- [ ] **Step 2: Commit UI updates**

```bash
git add src/components/auth/AuthScreen.tsx
git commit -m "feat(auth): show resend countdown and button in UI"
```

### Task 5: Final Validation

- [ ] **Step 1: Manual verification of the flow**
- [ ] **Step 2: Run build to ensure no TS errors**
```bash
npm run build
```
