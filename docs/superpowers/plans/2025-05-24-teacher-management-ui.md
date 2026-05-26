# Teacher Management UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Teacher Management UI within an admin panel, including a sidebar layout, teacher data fetching from Supabase, and integration into the main application.

**Architecture:**
1. `AdminLayout.tsx`: A side-nav based layout for administrative tasks.
2. `TeacherManager.tsx`: A view to manage (list) teachers, fetching data from the `teachers` Supabase table.
3. `App.tsx`: Toggle logic to switch between the mobile-emulator student view and the desktop-style admin panel.

**Tech Stack:** React (TypeScript), Lucide React, Supabase, Tailwind CSS.

---

### Task 1: Create AdminLayout Component

**Files:**
- Create: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Write `src/components/admin/AdminLayout.tsx`**

```tsx
import React from 'react';
import { Calendar, Users, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'schedule' | 'teachers';
  setActiveTab: (tab: 'schedule' | 'teachers') => void;
  onExit: () => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab, onExit }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 font-black tracking-wider uppercase text-sm">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${
            activeTab === 'schedule' ? 'bg-rose-500' : 'text-slate-400 hover:bg-white/5'
          }`}>
            <Calendar className="w-5 h-5" />
            <span className="font-bold text-sm">排课管理</span>
          </button>
          <button onClick={() => setActiveTab('teachers')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${
            activeTab === 'teachers' ? 'bg-rose-500' : 'text-slate-400 hover:bg-white/5'
          }`}>
            <Users className="w-5 h-5" />
            <span className="font-bold text-sm">教师库</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onExit} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm">退出后台</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 font-black uppercase text-slate-800">
          {activeTab === 'schedule' ? 'Schedule' : 'Teachers'}
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminLayout.tsx
git commit -m "feat: add AdminLayout component"
```

### Task 2: Create TeacherManager Component

**Files:**
- Create: `src/components/admin/TeacherManager.tsx`
- Ref: `src/lib/supabase.ts`

- [ ] **Step 1: Write `src/components/admin/TeacherManager.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  bio: string | null;
  created_at: string;
}

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 font-bold text-slate-400">Loading teachers...</div>;
  if (error) return <div className="p-4 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">教师库 ({teachers.length})</h2>
        <button 
          onClick={() => fetchTeachers()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
        >
          刷新列表
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-lg">{teacher.name}</h3>
                <div className="mt-2 space-y-1">
                  {teacher.email && (
                    <div className="flex items-center text-xs text-slate-500 font-bold">
                      <Mail className="w-3 h-3 mr-2" />
                      {teacher.email}
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center text-xs text-slate-500 font-bold">
                      <Phone className="w-3 h-3 mr-2" />
                      {teacher.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {teacher.specialties && teacher.specialties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.specialties.map((spec, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {teacher.bio && (
              <p className="mt-4 text-xs text-slate-500 font-medium line-clamp-2">
                {teacher.bio}
              </p>
            )}
          </div>
        ))}
        
        {teachers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">暂无教师数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/TeacherManager.tsx
git commit -m "feat: add TeacherManager component with Supabase integration"
```

### Task 3: Update App.tsx with Admin Mode

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports and state**

```tsx
import AdminLayout from './components/admin/AdminLayout';
import TeacherManager from './components/admin/TeacherManager';

// Inside App component
const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
const [adminTab, setAdminTab] = useState<'schedule' | 'teachers'>('schedule');
```

- [ ] **Step 2: Add Admin toggle in ProfileView props or via a "Secret" button**
Let's add it to `ProfileView`'s props and usage.

- [ ] **Step 3: Update return statement to handle isAdminMode**

```tsx
  if (isAdminMode) {
    return (
      <AdminLayout 
        activeTab={adminTab} 
        setActiveTab={setAdminTab} 
        onExit={() => setIsAdminMode(false)}
      >
        {adminTab === 'teachers' ? (
          <TeacherManager />
        ) : (
          <div className="p-8 text-center text-slate-400 font-bold">Schedule Management coming soon...</div>
        )}
      </AdminLayout>
    );
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate admin mode into App"
```
