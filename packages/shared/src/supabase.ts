import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './mock-client';

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const createSupabaseClient = (config: SupabaseConfig): SupabaseClient => {
  const { url, anonKey } = config;

  // Robust check for placeholder credentials
  const isPlaceholder = 
    !url || 
    !anonKey || 
    !isValidUrl(url) || 
    url.includes('your-project') || 
    url.includes('your_supabase_url') || 
    anonKey.includes('your_anon_key');

  if (isPlaceholder) {
    console.warn('Supabase URL/Key is missing or invalid. Falling back to Mock Supabase Client.');
    return createMockSupabaseClient() as unknown as SupabaseClient;
  }

  return createClient(url, anonKey);
};

// Singleton instance for convenience, though it needs to be initialized
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (config?: SupabaseConfig): SupabaseClient => {
  if (!supabaseInstance) {
    if (!config) {
      throw new Error('Supabase client must be initialized with config before use or config must be provided to getSupabase.');
    }
    supabaseInstance = createSupabaseClient(config);
  }
  return supabaseInstance;
};

/**
 * Performs a silent WeChat login by exchanging a code for an openid.
 * Note: This requires a Supabase Edge Function to handle the exchange.
 */
export const wechatLogin = async (code: string) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.functions.invoke('wechat-login', {
      body: { code }
    });
    
    if (error) throw error;
    
    if (data?.session) {
      await supabase.auth.setSession(data.session);
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('WeChat login failed:', err);
    return { data: null, error: err };
  }
};
