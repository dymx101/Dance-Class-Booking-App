# Schedule Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Publishing Engine" sync logic in `ScheduleManager.tsx` to generate class instances from templates for the next 14 days.

**Architecture:** Add `syncInstances` function to `ScheduleManager.tsx` for bulk creation of missing instances. Add UI triggers in header and preview modal.

**Tech Stack:** React, TypeScript, Supabase, Lucide React, motion/react.

---

### Task 1: Add State and UI for Sync Button in Header

**Files:**
- Modify: `src/components/admin/ScheduleManager.tsx`

- [ ] **Step 1: Add `syncLoading` state**

```tsx
  const [syncLoading, setSyncLoading] = useState(false);
```

- [ ] **Step 2: Add "Sync to Live Schedule" button in header**

```tsx
        <div className="flex space-x-3">
          <button 
            onClick={() => syncInstances()}
            disabled={syncLoading}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:border-rose-200 hover:text-rose-500 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {syncLoading ? (
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CalendarDays className="w-5 h-5" />
            )}
            <span>{syncLoading ? 'Syncing...' : 'Sync to Live'}</span>
          </button>
          <button 
            onClick={() => setIsPreviewOpen(true)}
            // ... existing
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ScheduleManager.tsx
git commit -m "feat: add sync button and loading state to ScheduleManager"
```

### Task 2: Implement `syncInstances` Logic

**Files:**
- Modify: `src/components/admin/ScheduleManager.tsx`

- [ ] **Step 1: Implement `syncInstances` function**

```tsx
  const syncInstances = async () => {
    try {
      setSyncLoading(true);
      setError(null);

      // 1. Calculate range: Today to +14 days
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13);
      endDate.setHours(23, 59, 59, 999);

      const startDateStr = getLocalDateString(startDate);
      const endDateStr = getLocalDateString(endDate);

      // 2. Fetch active templates
      const activeTemplates = templates.filter(t => t.isActive);
      if (activeTemplates.length === 0) {
        throw new Error("No active templates found to sync.");
      }

      // 3. Fetch existing instances in range
      const { data: existingInstances, error: fetchError } = await supabase
        .from('class_instances')
        .select('templateId, date')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (fetchError) throw fetchError;

      // 4. Generate missing instances
      const toCreate: any[] = [];
      const existingMap = new Set(existingInstances?.map(inst => `${inst.templateId}_${inst.date}`));

      for (let i = 0; i < 14; i++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + i);
        const targetDateStr = getLocalDateString(targetDate);
        const dayOfWeek = targetDate.getDay();

        const dayTemplates = activeTemplates.filter(t => t.dayOfWeek === dayOfWeek);
        
        for (const template of dayTemplates) {
          if (!existingMap.has(`${template.id}_${targetDateStr}`)) {
            toCreate.push({
              templateId: template.id,
              date: targetDateStr,
              teacherId: template.teacherId,
              timeStart: template.timeStart,
              timeEnd: template.timeEnd,
              title: template.title,
              genre: template.genre,
              classroom: template.classroom,
              difficulty: template.difficulty,
              maxCount: template.maxCount,
              minPeople: template.minPeople,
              type: template.type,
              status: 'scheduled'
            });
          }
        }
      }

      if (toCreate.length === 0) {
        alert("Schedule is already up to date.");
        return;
      }

      // 5. Bulk insert
      const { error: insertError } = await supabase
        .from('class_instances')
        .insert(toCreate);

      if (insertError) throw insertError;

      alert(`Successfully synced ${toCreate.length} new sessions to the live schedule!`);
      setIsPreviewOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncLoading(false);
    }
  };
```

- [ ] **Step 2: Update the preview modal button to call `syncInstances`**

```tsx
                  <button 
                    onClick={() => syncInstances()}
                    disabled={syncLoading}
                    className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {syncLoading ? '正在同步...' : '立即发布排课'}
                  </button>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ScheduleManager.tsx
git commit -m "feat: implement syncInstances logic and update preview modal"
```

### Task 3: Final Verification

- [ ] **Step 1: Verify the sync button works in the header**
- [ ] **Step 2: Verify the sync button works in the preview modal**
- [ ] **Step 3: Confirm no duplicate instances are created if clicked twice**
