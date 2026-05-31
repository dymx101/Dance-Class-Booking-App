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

  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => ({ 
      unsubscribe: () => {} 
    }),
    send: () => Promise.resolve('ok'),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: getMockSession() }, error: null }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        listeners.push(callback);
        const currentSession = getMockSession();
        setTimeout(() => callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession), 0);
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
            user_metadata: { full_name: 'Demo User' },
            app_metadata: { role: email.includes('admin') ? 'admin' : 'user' },
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
      getUser: async () => ({ data: { user: getMockSession()?.user ?? null }, error: null }),
    },
    from: (table: string) => ({
      select: (columns: string = '*') => {
        const query = {
          eq: (col: string, val: any) => ({
            single: () => Promise.resolve({
              data: table === 'users' ? { id: 'mock_user_id', name: 'Demo User', remainingpasses: 12, privatepasses: 4, experiencepoints: 450 } : null,
              error: null
            }),
            in: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
            select: () => query,
            single_or_empty: () => Promise.resolve({ data: null, error: null })
          }),
          order: (col: string, options: any) => ({
            order: () => Promise.resolve({
              data: table === 'class_instances' ? generateClasses() : [],
              error: null
            }),
            single: () => Promise.resolve({ data: null, error: null }),
            eq: () => query,
            select: () => query
          }),
          single: () => Promise.resolve({
            data: table === 'users' ? { id: 'mock_user_id', name: 'Demo User', remainingpasses: 12, privatepasses: 4, experiencepoints: 450 } : null,
            error: null
          }),
          limit: () => query,
          range: () => query,
          abortSignal: () => query
        };
        return query;
      },
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      insert: () => ({ returning: () => Promise.resolve({ data: [], error: null }) }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    }),
    rpc: async (fn: string, params: any) => {
      console.log('[MOCK RPC] Calling', fn, 'with', params);
      if (fn === 'book_class') {
        return { data: { success: true, status: 'booked' }, error: null };
      }
      if (fn === 'cancel_booking' || fn === 'cancel_private_session') {
        return { data: { success: true, refunded: true }, error: null };
      }
      if (fn === 'request_private_session') {
        return { data: { success: true, booking_id: 'mock_b1' }, error: null };
      }
      return { data: { success: true }, error: null };
    },
    channel: () => mockChannel,
    functions: {
      invoke: async (fn: string, options: any) => {
        console.log('[MOCK FUNCTION] Invoking', fn, 'with', options);
        if (fn === 'create-checkout') {
          return { data: { url: window.location.href + '?session_id=mock_session' }, error: null };
        }
        return { data: { success: true }, error: null };
      }
    }
  } as any;
};
