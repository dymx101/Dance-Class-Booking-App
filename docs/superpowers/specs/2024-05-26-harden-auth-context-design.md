# Design Spec: Harden AuthContext Profile Fetching

## Problem
Currently, `fetchProfile` in `AuthContext` can suffer from race conditions:
1. State updates can occur after a user signs out.
2. Multiple overlapping requests can result in the "wrong" (older) profile being set if an earlier request finishes after a later one.
3. The retry logic uses a fixed delay, which is less efficient than exponential backoff.

## Proposed Solution

### 1. Request Tracking
Use a `useRef<number>(0)` called `lastFetchId` to track the latest profile fetch attempt.
Each call to `fetchProfile` will increment this ID.

### 2. Exponential Backoff
Implement exponential backoff for retries:
`delay = initialDelay * Math.pow(2, attempt)` where `initialDelay` is 500ms.

### 3. Stale Checks
Before any state update (`setProfile`, `setLoading`), verify if the current `fetchId` matches `lastFetchId.current`.

## Implementation Details

### Changes in `AuthProvider`:
- Add `const lastFetchId = useRef(0);`.
- Update `fetchProfile` to:
    - Increment `lastFetchId.current`.
    - Store the new value in a local `fetchId`.
    - Use the exponential backoff calculation for `setTimeout`.
    - Check `if (fetchId !== lastFetchId.current) return;` before calling `setProfile` or `setLoading`.

### Testing Plan
- Simulate multiple rapid auth state changes and verify only the last one updates the state.
- Verify `loading` state transitions correctly.
- Ensure sign-out immediately invalidates pending fetches.
