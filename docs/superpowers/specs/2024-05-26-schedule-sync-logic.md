# Schedule Sync Logic Design

**Goal:** Implement the "Publishing Engine" to sync class templates to live class instances for the next 14 days.

## Architecture
- **Location:** `src/components/admin/ScheduleManager.tsx`
- **Function:** `syncInstances()`
- **Trigger:** "Sync to Live Schedule" button in header and "立即发布排课" in preview modal.

## Data Model Mapping
When generating an instance from a template:
- `templateId` = `template.id`
- `date` = Target date (YYYY-MM-DD)
- `teacherId` = `template.teacherId`
- `timeStart` = `template.timeStart`
- `timeEnd` = `template.timeEnd`
- `title` = `template.title`
- `genre` = `template.genre`
- `classroom` = `template.classroom`
- `difficulty` = `template.difficulty`
- `maxCount` = `template.maxCount`
- `minPeople` = `template.minPeople`
- `type` = `template.type`
- `status` = 'scheduled'

## Algorithm
1.  **Define Range:** `startDate` = Today, `endDate` = Today + 13 days.
2.  **Fetch Templates:** `SELECT * FROM class_templates WHERE isActive = true`.
3.  **Fetch Existing:** `SELECT templateId, date FROM class_instances WHERE date >= startDate AND date <= endDate`.
4.  **Generate Missing:**
    - Loop from `i = 0` to `13`:
      - `targetDate` = `startDate` + `i` days.
      - `targetDayOfWeek` = `targetDate.getDay()`.
      - For each `template` where `template.dayOfWeek === targetDayOfWeek`:
        - Check if `(template.id, targetDateString)` exists in `Existing`.
        - If not, add to `toCreate` list.
5.  **Bulk Insert:** `supabase.from('class_instances').insert(toCreate)`.

## UI/UX
- Button in Header: "Sync to Live Schedule" with `Calendar` icon.
- Loading state: Disable button, show "Syncing..." and a spinner.
- Success: Show a summary message like "Successfully created X new sessions for the next 14 days."
- Error: Use existing error banner.

## Implementation Plan
- Step 1: Add `syncLoading` and `syncSummary` states.
- Step 2: Implement `syncInstances` logic.
- Step 3: Add the Sync button to the header.
- Step 4: Hook up the button in the preview modal.
- Step 5: Test with mock data/Supabase.
