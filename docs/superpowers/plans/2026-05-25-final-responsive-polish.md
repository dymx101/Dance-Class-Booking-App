# Final Responsive Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix final responsive navigation issues in Admin layout and clean up Tailwind CSS typos in Schedule view.

**Architecture:** 
- Add a bottom navigation bar for mobile devices in `AdminLayout.tsx`.
- Use a series of `replace` operations to fix non-standard Tailwind classes in `ScheduleView.tsx`.
- Verify the changes with a full build.

**Tech Stack:** React, Tailwind CSS v4, Lucide React

---

### Task 1: Add Mobile Navigation to AdminLayout

**Files:**
- Modify: `apps/web/src/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Implement Mobile Bottom Navigation**

Add a `nav` element at the bottom of the layout that is only visible on mobile screens (`md:hidden`).

```tsx
<<<<
        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mb-32"></div>
      </div>
    </div>
  );
}
====
        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-30">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'analytics' ? 'text-rose-500' : 'text-slate-400'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">数据 Analytics</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'schedule' ? 'text-rose-500' : 'text-slate-400'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">排课 Schedule</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('teachers')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'teachers' ? 'text-rose-500' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">教师 Teachers</span>
          </button>
        </nav>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mb-32"></div>
      </div>
    </div>
  );
}
>>>>
```

- [ ] **Step 2: Add padding to main content for mobile nav**

Update the `main` element to have bottom padding on mobile to avoid content being hidden by the fixed bottom nav.

```tsx
<<<<
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-[#F8FAFC]">
====
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-24 md:pb-8 lg:pb-12 bg-[#F8FAFC]">
>>>>
```

- [ ] **Step 3: Commit AdminLayout changes**

```bash
git add apps/web/src/components/admin/AdminLayout.tsx
git commit -m "feat(admin): add mobile bottom navigation bar"
```

### Task 2: Fix Tailwind CSS Typos in ScheduleView

**Files:**
- Modify: `apps/web/src/components/ScheduleView.tsx`

- [ ] **Step 1: Fix all identified typos**

Apply the following replacements:
- `border-teal-555` -> `border-teal-500`
- `text-rose-605` -> `text-rose-600`
- `bg-teal-750` -> `bg-teal-700`
- `shadow-teal-550/10` -> `shadow-teal-500/10`
- `shadow-rose-550/10` -> `shadow-rose-500/10`
- `text-rose-455` -> `text-rose-400`
- `text-zinc-405` -> `text-zinc-400`
- `text-zinc-305` -> `text-zinc-300`
- `bg-teal-550` -> `bg-teal-500`
- `text-slate-650` -> `text-slate-600`
- `text-slate-505` -> `text-slate-500`
- `text-zinc-650` -> `text-zinc-600`
- `text-teal-605` -> `text-teal-600`
- `text-rose-405` -> `text-rose-400`
- `bg-slate-205` -> `bg-slate-200`
- `text-zinc-350` -> `text-zinc-300`
- `border-slate-250` -> `border-slate-200`
- `text-slate-850` -> `text-slate-800`
- `bg-teal-650` -> `bg-teal-600`

- [ ] **Step 2: Scan for any remaining typos**

Run `grep -E "\-[a-z]+\-[0-9]{3}" apps/web/src/components/ScheduleView.tsx | grep -vE "-(50|[0-9]00)"` to find any missed ones.

- [ ] **Step 3: Commit ScheduleView changes**

```bash
git add apps/web/src/components/ScheduleView.tsx
git commit -m "style: fix non-standard tailwind classes in ScheduleView"
```

### Task 3: Final Verification

- [ ] **Step 1: Build the web app**

Run: `npm run build -w @dance-app/web`
Expected: Success

- [ ] **Step 2: Verify no remaining typos in codebase (optional but good)**

- [ ] **Step 3: Final Commit (if needed for any last fixes)**

```bash
git add .
git commit -m "style: final responsive fixes and polish"
```
