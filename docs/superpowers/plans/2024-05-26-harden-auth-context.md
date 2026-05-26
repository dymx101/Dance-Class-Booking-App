# Harden AuthContext Profile Fetching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent race conditions in profile fetching and implement exponential backoff for improved reliability.

**Architecture:** Use a `useRef` to track the latest request ID and perform stale checks before any state updates. Implement exponential backoff in the retry loop.

**Tech Stack:** React, Supabase, TypeScript

---

### Task 1: Add lastFetchId and Implement Stale Checks

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Add lastFetchId ref to AuthProvider**
Add `const lastFetchId = useRef(0);` at the top of the `AuthProvider` component.

- [ ] **Step 2: Update fetchProfile to track requests and add stale checks**
Update `fetchProfile` to increment `lastFetchId.current` and check it before calling `setProfile` or `setLoading`.

```typescript
  const fetchProfile = async (userId: string) => {
    const fetchId = ++lastFetchId.current;
    const maxRetries = 5;
    const initialDelay = 500;

    for (let i = 0; i < maxRetries; i++) {
      try {
        if (fetchId !== lastFetchId.current) return;
        setLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (fetchId !== lastFetchId.current) return;

        if (error) {
          if (error.code === 'PGRST116' && i < maxRetries - 1) {
            const delay = initialDelay * Math.pow(2, i);
            console.warn(`Profile not found yet, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          console.warn('Profile fetch result:', error.message);
          setProfile(null);
        } else {
          setProfile(data);
          setLoading(false);
          return;
        }
      } catch (error) {
        if (fetchId !== lastFetchId.current) return;
        console.error('Error fetching profile:', error);
        if (i === maxRetries - 1) {
          setProfile(null);
        } else {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
    
    if (fetchId === lastFetchId.current) {
      setLoading(false);
    }
  };
```

- [ ] **Step 3: Update sign-out to invalidate pending fetches**
Ensure `signOut` increments the fetch ID to prevent any pending fetches from updating state.

```typescript
  const signOut = async () => {
    lastFetchId.current++;
    await supabase.auth.signOut();
  };
```

- [ ] **Step 4: Verify implementation**
Check that `useRef` is imported from 'react'.

- [ ] **Step 5: Commit changes**
Add the changes and amend the previous commit as requested.

```bash
git add src/contexts/AuthContext.tsx
git commit --amend --no-edit
```
