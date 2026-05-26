import { supabase } from './lib/supabase';

/**
 * RLS & TRIGGER AUDIT TOOL (2026-05-27)
 * 
 * This script provides functions to verify the security configuration 
 * and trigger-based user synchronization.
 */

/**
 * 1. TRIGGER VERIFICATION
 * Verifies if the sync trigger successfully created a profile in public.users
 */
export async function verifyUserSync(userId: string) {
  console.log(`[TRIGGER] Verifying sync for user ${userId}...`);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.error('❌ FAIL: User not found in public.users. Trigger might have failed or lagged.');
    } else {
      console.error('❌ ERROR:', error.message);
    }
    return false;
  }

  console.log('✅ PASS: User found in public.users:', data);
  return true;
}

/**
 * 2. RLS AUDIT
 * Tests if the current session can access specific resources according to policies.
 */
export async function auditRLS() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  console.log('\n--- RLS POLICY AUDIT ---');
  console.log(`Current User: ${user?.email || 'Anonymous'}`);
  console.log(`User ID: ${user?.id || 'None'}`);

  // Test 1: Public access
  const { data: teachers, error: tError } = await supabase.from('teachers').select('id').limit(1);
  console.log(`[Public] Read Teachers: ${tError ? '❌ FAIL (' + tError.message + ')' : '✅ PASS (' + (teachers?.length || 0) + ' found)'}`);

  // Test 2: Own Profile access
  if (user) {
    const { data: profile, error: pError } = await supabase.from('users').select('*').eq('id', user.id).single();
    console.log(`[User] Read Own Profile: ${pError ? '❌ FAIL (' + pError.message + ')' : '✅ PASS'}`);
    
    // Test 3: Other Profile access (Should fail)
    const { data: others, error: oError } = await supabase.from('users').select('*').neq('id', user.id).limit(1);
    const othersFound = others && others.length > 0;
    console.log(`[Security] Read Other Profiles: ${othersFound ? '❌ VULNERABLE (Found others)' : '✅ SECURE (Blocked or Empty)'}`);
  } else {
    console.log('[User] Skipping auth-required tests (No session)');
  }

  // Test 4: Admin access (Conditional)
  const isAdmin = user?.email?.includes('admin');
  if (isAdmin) {
    const { data: allUsers, error: aError } = await supabase.from('users').select('id').limit(5);
    console.log(`[Admin] Read All Profiles: ${aError ? '❌ FAIL (' + aError.message + ')' : '✅ PASS'}`);
  }
}

// If run directly via tsx
if (import.meta.url.endsWith('verify-auth-trigger.test.ts')) {
  auditRLS().catch(console.error);
}
