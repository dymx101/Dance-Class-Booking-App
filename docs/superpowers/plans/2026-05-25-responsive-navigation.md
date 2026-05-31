# Responsive Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a responsive navigation system with a vertical Sidebar for desktop and a fixed TabBar for mobile.

**Architecture:** Encapsulate navigation logic in a `Navigation` component that renders different UIs based on screen size (using Tailwind's responsive prefixes).

**Tech Stack:** React, Tailwind CSS, Lucide React, Motion.

---

### Task 1: Create Navigation Component

**Files:**
- Create: `apps/web/src/components/Navigation.tsx`

- [ ] **Step 1: Define Navigation component and props**

```tsx
import React from 'react';
import { Home, CalendarDays, ShoppingBag, User, Bell } from 'lucide-react';
import { AppTheme } from '@dance-app/shared';

interface NavigationProps {
  activeTab: 'home' | 'schedule' | 'store' | 'profile';
  setActiveTab: (tab: 'home' | 'schedule' | 'store' | 'profile') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  theme: AppTheme;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  theme
}) => {
  // Implementation will follow
  return null;
};
```

- [ ] **Step 2: Implement Desktop Sidebar UI**

```tsx
// Inside Navigation component
const Sidebar = () => (
  <aside className="hidden md:flex w-64 h-screen bg-slate-900 flex-col border-r border-slate-800 shrink-0 sticky top-0 left-0">
    <div className="p-8">
      <h1 className="text-2xl font-black text-white tracking-tighter italic">PLAN A</h1>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Dance Studio</p>
    </div>

    <nav className="flex-1 px-4 space-y-2 mt-4">
      {[
        { id: 'home', label: '首页 / Home', icon: Home },
        { id: 'schedule', label: '课表 / Schedule', icon: CalendarDays },
        { id: 'store', label: '商城 / Store', icon: ShoppingBag },
        { id: 'profile', label: '我的 / Profile', icon: User },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as any)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === item.id 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-sm font-bold">{item.label}</span>
        </button>
      ))}
    </nav>

    <div className="p-4 border-t border-slate-800">
      <button
        onClick={onOpenNotifications}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all relative"
      >
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-sm font-bold">通知 / Alerts</span>
      </button>
    </div>
  </aside>
);
```

- [ ] **Step 3: Implement Mobile TabBar UI (Refactored from App.tsx)**

```tsx
// Inside Navigation component
const TabBar = () => (
  <div className={`md:hidden px-3 py-2 flex items-center justify-around select-none z-30 shrink-0 shadow-2xl backdrop-blur-md border-t transition-colors duration-500 ${
    theme === 'midnight-cyber' 
      ? 'bg-[#0f111a]/95 border-white/5' 
      : theme === 'cool-mint'
      ? 'bg-white/95 border-slate-200/60'
      : 'bg-white/95 border-[#EBE6DD]'
  }`} id="footer-navigation">
    {[
      { id: 'home', label: '首页', icon: Home },
      { id: 'schedule', label: '课表', icon: CalendarDays },
      { id: 'store', label: '商城', icon: ShoppingBag },
      { id: 'profile', label: '我的', icon: User },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id as any)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
          activeTab === item.id 
            ? (theme === 'cool-mint' ? 'text-teal-600 font-black' : 'text-rose-500 font-black') 
            : 'text-slate-400 hover:text-slate-650'
        }`}
      >
        <item.icon className={`w-4.5 h-4.5 transition-transform ${
          activeTab === item.id 
            ? `scale-110 ${theme === 'cool-mint' ? 'text-teal-600' : 'text-rose-500'}` 
            : 'text-slate-400'
        }`} />
        <span className="text-[9px] mt-1 font-sans font-black uppercase tracking-wider">{item.label}</span>
      </button>
    ))}
  </div>
);
```

- [ ] **Step 4: Combine into final component**

```tsx
return (
  <>
    <Sidebar />
    <TabBar />
  </>
);
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/Navigation.tsx
git commit -m "feat(ui): create Navigation component with Sidebar and TabBar"
```

### Task 2: Refactor App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Import Navigation component**

```tsx
import { Navigation } from './components/Navigation';
```

- [ ] **Step 2: Update main layout container**

Change the root div class to include `flex-col md:flex-row`.

- [ ] **Step 3: Replace old TabBar and Theme Switcher (if moving notifications)**

Actually, the prompt said `onOpenNotifications` is a prop. In `App.tsx`, the theme switcher is currently at the top. I should keep the layout consistent.

Refactored `App.tsx` structure:
```tsx
return (
  <div className={`w-full h-screen relative overflow-hidden ${getAppBg()} flex flex-col md:flex-row transition-all duration-500 font-sans antialiased`}>
    
    <Navigation 
      activeTab={activeTab}
      setActiveTab={handleTabSuggestion}
      unreadCount={unreadCount}
      onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      theme={currentTheme}
    />

    <main className="flex-1 flex flex-col min-w-0 relative h-full">
      {/* Top Header (Mobile only or both?) */}
      {/* The existing theme switcher is at the top. On desktop, maybe it stays at the top of the main area? */}
      
      {/* Content */}
      <div className={`flex-1 overflow-hidden flex flex-col relative transition-colors duration-500 ...`} id="main-viewport-body">
        {renderViewContent()}
      </div>
    </main>

    {/* Notification Components (Toasts, etc) */}
  </div>
);
```

- [ ] **Step 4: Verify responsiveness**
- [ ] **Step 5: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat(ui): integrate responsive Navigation into App"
```
