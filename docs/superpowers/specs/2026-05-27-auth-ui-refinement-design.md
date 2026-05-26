# Design Doc: Auth UI Refinement (Error Mapping & Resend Countdown)

## Goal
Improve the user experience of the authentication screen by providing clearer, bilingual error messages and a 60-second countdown for SMS resends.

## Architecture
- **Error Mapping**: A centralized object mapping Supabase error codes to English and Chinese messages.
- **Countdown State**: Local state in `AuthScreen` to manage the resend timer.
- **Timer Logic**: A `useEffect` hook that handles the 60-second decrement.

## Components & UI
- **AuthScreen**:
    - Update `handleSendCode` and `handleVerifyCode` to use the error map.
    - Add `countdown` state.
    - Add a `useEffect` to manage the countdown.
    - Add a "Resend" section below the OTP input or as part of the action buttons.
    - Show "Resend code in X s" while the timer is active.
    - Enable the "Resend" button when the timer hits zero.

## Error Mapping
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

## Implementation Plan
1. Define `AUTH_ERRORS` constant.
2. Add `countdown` and `canResend` state.
3. Implement `useEffect` for the timer.
4. Update error handling in `try-catch` blocks.
5. Update UI to show countdown and resend button.
6. Verify styling matches the existing "STUDIO" theme (black/white/zinc).

## Testing
- Trigger "Too many requests" by sending codes multiple times.
- Enter an invalid code to see the "Invalid or expired code" message.
- Wait 60 seconds to see the "Resend" button become active.
