import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as Profile } from '@dance-app/shared';

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
  const lastFetchId = useRef(0);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(currentUser);
        if (currentUser) {
          setLoading(true);
          await fetchProfile(currentUser.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'USER_UPDATED') {
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const fetchId = ++lastFetchId.current;
    const maxRetries = 5;
    const initialDelay = 500;

    for (let i = 0; i < maxRetries; i++) {
      try {
        if (fetchId !== lastFetchId.current) return;
        setLoading(true);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchId !== lastFetchId.current) return;

        if (error) {
          // PGRST116 means no rows found
          if (error.code === 'PGRST116' && i < maxRetries - 1) {
            const delay = initialDelay * Math.pow(2, i);
            console.warn(`Profile not found yet, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          console.warn('Profile fetch result:', error.message);
          setProfile(null);
        } else {
          setProfile(data);
          if (fetchId === lastFetchId.current) {
            setLoading(false);
          }
          return;
        }
      } catch (error) {
        if (fetchId !== lastFetchId.current) return;
        console.error('Error fetching profile:', error);
        if (i === maxRetries - 1) {
          setProfile(null);
        } else {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    if (fetchId === lastFetchId.current) {
      setLoading(false);
    }
  };

  const signOut = async () => {
    lastFetchId.current++;
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
