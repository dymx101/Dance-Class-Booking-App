# Global Schedule Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time global schedule synchronization by subscribing to the `bookings` table changes and refreshing the app state.

**Architecture:** Use Supabase Realtime to listen for all changes on the `bookings` table in `NotificationContext`. Broadcast a custom DOM event `supabase:bookings_changed` when changes occur. In `App.tsx`, listen for this event and trigger a debounced data refresh.

**Tech Stack:** React, Supabase JS Client, Custom DOM Events.

---

### Task 1: Refactor NotificationContext for Global Booking Sync

**Files:**
- Modify: `src/contexts/NotificationContext.tsx`

- [ ] **Step 1: Move booking subscription to a dedicated useEffect**
Move the `bookingSubscription` logic out of the user-dependent `useEffect` and into a new `useEffect` that runs once on mount. Ensure it broadcasts the `classId`.

```typescript
  // Subscribe to global bookings for spot sync
  useEffect(() => {
    const bookingSubscription = supabase
      .channel('global-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          const classId = (payload.new as any)?.classId || (payload.old as any)?.classId;
          // Dispatch custom event to notify components that spots might have changed
          window.dispatchEvent(new CustomEvent('supabase:bookings_changed', { 
            detail: { classId, payload } 
          }));
        }
      )
      .subscribe();

    return () => {
      bookingSubscription.unsubscribe();
    };
  }, []);
```

- [ ] **Step 2: Remove the old booking subscription from the user useEffect**
Clean up the redundant subscription in the existing `useEffect`.

---

### Task 2: Implement Debounced Refresh in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add debounced refresh logic**
Update the event listener to use a debounced call to `fetchClassesAndBookings`.

```typescript
  // Listen for real-time booking changes from NotificationContext
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    const handleBookingsChanged = () => {
      // Clear existing timer if any
      clearTimeout(debounceTimer);
      
      // Debounce the refresh by 500ms to handle rapid changes
      debounceTimer = setTimeout(() => {
        fetchClassesAndBookings();
      }, 500);
    };

    window.addEventListener('supabase:bookings_changed', handleBookingsChanged);
    
    return () => {
      window.removeEventListener('supabase:bookings_changed', handleBookingsChanged);
      clearTimeout(debounceTimer);
    };
  }, []); // Note: fetchClassesAndBookings is not stable, but we want this listener to persist
```

---

### Task 3: Verification and Commit

- [ ] **Step 1: Verify the changes**
Check that the code compiles and there are no lint errors. Since we are in a headless environment, we rely on structural verification.
- [ ] **Step 2: Commit the changes**

```bash
git add src/contexts/NotificationContext.tsx src/App.tsx
git commit -m "feat(realtime): implement live schedule synchronization with debounced refresh"
```
