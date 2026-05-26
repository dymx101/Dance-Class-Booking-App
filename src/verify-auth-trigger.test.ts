import { supabase } from './lib/supabase';

/**
 * CONCEPTUAL TEST SCRIPT
 * This script demonstrates how to verify if a user exists in the public.users table.
 * In a real environment, this would be run after a user signs up.
 */

async function verifyUserSync(userId: string) {
  console.log(`Checking if user ${userId} exists in public.users...`);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return false;
  }

  if (data) {
    console.log('User found in public.users:', data);
    return true;
  }

  console.log('User not found.');
  return false;
}

// Export for potential use in local manual testing
export { verifyUserSync };
