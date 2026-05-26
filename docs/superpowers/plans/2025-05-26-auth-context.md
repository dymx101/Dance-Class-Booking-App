# AuthContext Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Supabase-based AuthContext to manage user authentication and profile state across the application.

**Architecture:** Use React Context API to provide `user` (Supabase), `profile` (Custom User type), `loading`, and `signOut` to the app. Wrap the main App component with the AuthProvider.

**Tech Stack:** React (TypeScript), Supabase JS Client.

---

### Task 1: Update User types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add `id: string` to the `User` interface**

```typescript
export interface User {
  id: string; // Add this
  name: string;
  phone: string;
  avatar: string;
  remainingPasses: number;
  experiencePoints: number;
  totalClassesJoined: number;
  favoriteStyle: string;
  streakDays: number;
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/types.ts
git commit -m "chore: add id to User type"
```

### Task 2: Create AuthContext

**Files:**
- Create: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Implement AuthProvider and useAuth hook**

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as Profile } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

- [ ] **Step 2: Commit changes**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat: implement AuthContext"
```

### Task 3: Integrate AuthProvider

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Wrap App with AuthProvider**

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // Add this

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

- [ ] **Step 2: Verify build**

Run: `npm run lint` (tsc)

- [ ] **Step 3: Commit changes**

```bash
git add src/main.tsx
git commit -m "feat: integrate AuthProvider into main entry point"
```
