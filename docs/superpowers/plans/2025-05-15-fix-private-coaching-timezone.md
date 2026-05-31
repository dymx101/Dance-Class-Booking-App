# Fix Private Coaching Timezone Bug Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix timezone mismatch in Private Coaching booking UI by ensuring all date calculations use local time consistently.

**Architecture:** Add a local date string helper and update `useMemo` hooks to parse and generate dates using local time methods.

**Tech Stack:** React, TypeScript.

---

### Task 1: Update PrivateCoachingView.tsx

**Files:**
- Modify: `apps/web/src/components/PrivateCoachingView.tsx`

- [ ] **Step 1: Add getLocalYYYYMMDD helper and update next7Days**

```typescript
  // Helper to get local date string
  const getLocalYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate next 7 days
  const next7Days = useMemo(() => {
    const dates = [];
    const today = new Date('2026-05-25'); // Simulation today
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = getLocalYYYYMMDD(d); // Fix: use local time helper
      dates.push({
        dateStr,
        dayName: i === 0 ? '今天' : WEEK_NAMES[d.getDay()],
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        dayOfWeek: d.getDay()
      });
    }
    return dates;
  }, []);
```

- [ ] **Step 2: Update availableSlots to parse selectedDate as local time**

```typescript
  // Generate slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedTeacher || !selectedDate) return [];
    
    // Fix: parse selectedDate manually as local time to avoid UTC mismatch
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const dayAvail = teacherAvailabilities.find(a => a.dayofweek === dayOfWeek);
    
    if (!dayAvail) return [];

    const slots = [];
    const startHour = parseInt(dayAvail.timestart.split(':')[0]);
    const endHour = parseInt(dayAvail.timeend.split(':')[0]);

    for (let h = startHour; h < endHour; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      slots.push({
        time: timeStr,
        isBooked: Math.random() > 0.8 // Randomly mark some slots as booked for UI demo
      });
    }
    return slots;
  }, [selectedTeacher, selectedDate, teacherAvailabilities]);
```

- [ ] **Step 3: Run lint to verify changes**

Run: `npm run lint -w @dance-app/web`
Expected: Success

- [ ] **Step 4: Commit changes**

Run: `git add apps/web/src/components/PrivateCoachingView.tsx`
Run: `git commit --amend --no-edit`
