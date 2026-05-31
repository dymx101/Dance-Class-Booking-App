# Design Doc: Fix Timezone Bug in Private Coaching Booking UI

**Date:** 2025-05-15
**Topic:** Timezone-safe date logic in `PrivateCoachingView.tsx`

## 1. Problem Description
The `PrivateCoachingView.tsx` component currently mixes UTC parsing with local time methods. 
- `next7Days` generates date strings using `d.toISOString().split('T')[0]`, which is UTC.
- `availableSlots` parses these strings using `new Date(selectedDate)`, which (for YYYY-MM-DD) is often interpreted as UTC midnight, but then calls `.getDay()`, which returns the day of the week in the local timezone.
- This causes a day-offset mismatch for users in timezones that are behind UTC (e.g., US timezones), leading to incorrect availability being displayed for the selected date.

## 2. Proposed Solution
Switch all date logic to use local time consistently. This ensures that "today" and the "day of the week" always align with the user's local perspective and the availability schedule.

### Changes:
1. **New Helper:** Add `getLocalYYYYMMDD(date: Date)` to generate "YYYY-MM-DD" strings using local `getFullYear()`, `getMonth()`, and `getDate()`.
2. **Update `next7Days`:**
   - Use `getLocalYYYYMMDD(d)` instead of `toISOString()`.
   - Ensure `dayOfWeek` is calculated using `d.getDay()` (local).
3. **Update `availableSlots`:**
   - Parse `selectedDate` manually into `year`, `month`, and `day` components.
   - Instantiate `dateObj` using `new Date(year, month - 1, day)`, which creates a local time Date object.
   - Use `dateObj.getDay()` to get the day of the week.

## 3. Implementation Plan
- Modify `apps/web/src/components/PrivateCoachingView.tsx`.
- Add the `getLocalYYYYMMDD` helper.
- Update `next7Days` useMemo.
- Update `availableSlots` useMemo.

## 4. Verification Plan
- Verify that for a given simulated "today" (2026-05-25), the generated `next7Days` have correct `dateStr` and `dayOfWeek`.
- Verify that selecting a date correctly filters `TEACHER_AVAILABILITY` by the matching `dayofweek`.
- Run `npm run lint` in `apps/web` to ensure no type errors were introduced.
