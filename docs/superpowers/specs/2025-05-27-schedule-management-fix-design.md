# Design Doc: Fix Schedule Management Logic

## Context
A quality review identified a timezone bug in the "Publish Preview" and missing validation in the template form within `ScheduleManager.tsx`.

## Goals
1. Fix the date calculation bug in `getPreviewData` to avoid UTC mismatches.
2. Add validation to `handleSave` to ensure `start_time` is before `end_time`.
3. Add Framer Motion animations to the schedule list for a better user experience.

## Proposed Changes

### 1. Fix Date Calculation
In `ScheduleManager.tsx`, I will implement a helper function `getLocalDateString` to format dates as `YYYY-MM-DD` based on local time.

```typescript
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

This will replace `currentDate.toISOString().split('T')[0]` in the `getPreviewData` function.

### 2. Add Form Validation
In the `handleSave` function, I will add a check to compare `formData.timeStart` and `formData.timeEnd`. If `timeStart` is not before `timeEnd`, an error message will be set, and the submission will be halted.

```typescript
if (formData.timeStart >= formData.timeEnd) {
  setError("Start time must be before end time.");
  return;
}
```

### 3. Add Animations
I will wrap the list items in `motion.div` and use `AnimatePresence` where appropriate to provide smooth transitions when templates are added, updated, or removed. Specifically, I'll add `layout` prop to the container of classes for each day.

## Verification Plan
1. **Date Bug:** Verify that the "Publish Preview" displays the correct local dates.
2. **Validation:** Attempt to save a template with an end time earlier than or equal to the start time and confirm the error message appears.
3. **Animations:** Manually verify that list items animate smoothly.
