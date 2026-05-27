import { createClient } from '@supabase/supabase-js';
import { generateClasses } from '../data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if URL is valid absolute URL
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl) || supabaseUrl.includes('your_supabase_url')) {
  console.warn('Supabase URL/Key is missing or invalid. Falling back to Mock Supabase Client.');

  // Mock State Storage
  const listeners: Array<(event: string, session: any) => void> = [];
  
  const getMockSession = () => {
    const saved = localStorage.getItem('plana_mock_session');
    return saved ? JSON.parse(saved) : null;
  };

  const setMockSession = (session: any) => {
    if (session) {
      localStorage.setItem('plana_mock_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('plana_mock_session');
    }
    listeners.forEach(l => l(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
  };

  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: getMockSession() }, error: null }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        listeners.push(callback);
        // Fire immediately with current state
        const currentSession = getMockSession();
        callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
        return { data: { subscription: { unsubscribe: () => {
          const index = listeners.indexOf(callback);
          if (index !== -1) listeners.splice(index, 1);
        } } } };
      },
      signInWithOtp: async ({ phone }: { phone: string }) => {
        console.log('[MOCK AUTH] signInWithOtp for phone:', phone);
        return { data: {}, error: null };
      },
      verifyOtp: async ({ phone, token }: { phone: string; token: string }) => {
        console.log('[MOCK AUTH] verifyOtp for phone:', phone, 'token:', token);
        const email = phone.includes('13800000000') || phone.includes('admin') 
          ? 'admin@plana.com' 
          : 'user@plana.com';
        
        const mockSession = {
          user: {
            id: 'mock_user_id',
            phone: phone,
            email: email,
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600,
          token_type: 'bearer',
        };
        
        setMockSession(mockSession);
        return { data: { session: mockSession }, error: null };
      },
      signOut: async () => {
        console.log('[MOCK AUTH] signOut');
        setMockSession(null);
        return { error: null };
      },
    },
    from: (table: string) => {
      return {
        select: (projection = '*') => {
          return {
            order: () => {
              return {
                order: () => {
                  return Promise.resolve({
                    data: table === 'class_instances' ? generateClasses() : [],
                    error: null
                  });
                },
                single: () => {
                  return Promise.resolve({
                    data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingPasses: 10 } : null,
                    error: null
                  });
                },
                eq: () => {
                  return {
                    in: () => Promise.resolve({ data: [], error: null }),
                    single: () => Promise.resolve({
                      data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingPasses: 10 } : null,
                      error: null
                    }),
                  };
                }
              };
            },
            eq: (column: string, value: any) => {
              return {
                in: (col: string, vals: any[]) => {
                  return Promise.resolve({ data: [], error: null });
                },
                single: () => {
                  return Promise.resolve({
                    data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingPasses: 10 } : null,
                    error: null
                  });
                },
                eq: () => ({
                  single: () => Promise.resolve({ data: null, error: null })
                })
              };
            },
            single: () => {
              return Promise.resolve({
                data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingPasses: 10 } : null,
                error: null
              });
            }
          };
        },
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        }),
        insert: () => ({
          returning: () => Promise.resolve({ data: [], error: null })
        })
      };
    },
    rpc: async (fn: string, params: any) => {
      console.log('[MOCK RPC] Calling', fn, 'with', params);
      if (fn === 'book_class') {
        return { data: [{ success: true, status: 'booked' }], error: null };
      }
      if (fn === 'cancel_booking') {
        return { data: [{ success: true, refunded: true }], error: null };
      }
      return { data: { success: true }, error: null };
    }
  } as any;
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
