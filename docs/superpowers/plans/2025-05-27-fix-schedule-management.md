# Fix Schedule Management Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix timezone bugs, add validation, and improve UX with animations in the Schedule Manager.

**Architecture:** Helper functions for date formatting, client-side validation in form submission, and Framer Motion for layout transitions.

**Tech Stack:** React, Framer Motion, Supabase.

---

### Task 1: Fix Date Calculation Bug

**Files:**
- Modify: `src/components/admin/ScheduleManager.tsx`

- [ ] **Step 1: Implement getLocalDateString helper**

```typescript
// Inside ScheduleManager.tsx, before the component or as a helper inside
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

- [ ] **Step 2: Update getPreviewData to use the helper**

Replace:
```typescript
const dateStr = currentDate.toISOString().split('T')[0];
```
With:
```typescript
const dateStr = getLocalDateString(currentDate);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ScheduleManager.tsx
git commit -m "fix: use local date string in schedule preview to avoid timezone mismatch"
```

### Task 2: Add Form Validation

**Files:**
- Modify: `src/components/admin/ScheduleManager.tsx`

- [ ] **Step 1: Add time validation to handleSave**

```typescript
// Inside handleSave function
if (formData.timeStart >= formData.timeEnd) {
  setError("开始时间必须早于结束时间。 (Start time must be before end time.)");
  setLoading(false);
  return;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/ScheduleManager.tsx
git commit -m "feat: add time validation to schedule template form"
```

### Task 3: Add Animations to Schedule List

**Files:**
- Modify: `src/components/admin/ScheduleManager.tsx`

- [ ] **Step 1: Add layout prop and AnimatePresence to schedule items**

Wrap the list items in `motion.div` with `layout` prop.

```typescript
// Inside the groupedTemplates.map loop, around the template mapping
<motion.div 
  layout
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95 }}
  key={template.id} 
  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors group"
>
  {/* ... existing item content ... */}
</motion.div>
```

- [ ] **Step 2: Commit and final cleanup**

```bash
git add src/components/admin/ScheduleManager.tsx
git commit --amend --no-edit
```
