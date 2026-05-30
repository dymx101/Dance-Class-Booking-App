import { generateClasses } from './mock-data';

export const createMockSupabaseClient = () => {
  const listeners: Array<(event: string, session: any) => void> = [];
  
  const getMockSession = () => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('dance_app_mock_session');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  const setMockSession = (session: any) => {
    if (typeof localStorage !== 'undefined') {
      if (session) {
        localStorage.setItem('dance_app_mock_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('dance_app_mock_session');
      }
    }
    listeners.forEach(l => l(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: getMockSession() }, error: null }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        listeners.push(callback);
        const currentSession = getMockSession();
        callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
        return { data: { subscription: { unsubscribe: () => {
          const index = listeners.indexOf(callback);
          if (index !== -1) listeners.splice(index, 1);
        } } } };
      },
      signInWithOtp: async () => ({ data: {}, error: null }),
      verifyOtp: async ({ phone }: { phone: string }) => {
        const email = phone.includes('13800000000') || phone.includes('admin') 
          ? 'admin@dance-app.com' 
          : 'user@dance-app.com';
        
        const mockSession = {
          user: { 
            id: 'mock_user_id', 
            phone, 
            email,
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated', 
            created_at: new Date().toISOString() 
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
        setMockSession(null);
        return { error: null };
      },
    },
    from: (table: string) => ({
      select: () => ({
        order: () => ({
          order: () => Promise.resolve({
            data: table === 'class_instances' ? generateClasses() : [],
            error: null
          }),
          single: () => Promise.resolve({
            data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingpasses: 10 } : null,
            error: null
          }),
          eq: () => ({
            in: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({
              data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingpasses: 10 } : null,
              error: null
            }),
          })
        }),
        eq: () => ({
          in: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({
            data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingpasses: 10 } : null,
            error: null
          }),
          eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) })
        }),
        single: () => Promise.resolve({
          data: table === 'users' ? { id: 'mock_user_id', name: 'Admin', remainingpasses: 10 } : null,
          error: null
        })
      }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      insert: () => ({ returning: () => Promise.resolve({ data: [], error: null }) })
    }),
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
};
