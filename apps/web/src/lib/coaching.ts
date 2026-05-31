import { supabase } from './supabase';
import type { TeacherAvailability, PrivateBooking } from '@dance-app/shared';

/**
 * Fetch availability for a specific teacher
 */
export async function getTeacherAvailability(teacherId: string): Promise<TeacherAvailability[]> {
  const { data, error } = await supabase
    .from('teacher_availability')
    .select('*')
    .eq('teacherid', teacherId);

  if (error) {
    console.error('Error fetching teacher availability:', error);
    throw error;
  }

  return data || [];
}

/**
 * Request a private session with a teacher
 */
export async function requestPrivateSession(params: {
  teacherId: string;
  scheduledAt: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data, error: rpcError } = await supabase.rpc('request_private_session', {
    p_teacher_id: params.teacherId,
    p_scheduled_at: params.scheduledAt,
    p_notes: params.notes || ''
  });

  if (rpcError) {
    console.error('Error requesting private session:', rpcError);
    return { success: false, error: rpcError.message };
  }

  if (data && typeof data === 'object' && !data.success) {
    return { success: false, error: data.error || 'Failed to request session' };
  }

  return { success: true };
}

/**
 * Fetch all private bookings for the current authenticated user
 */
export async function getUserPrivateBookings(): Promise<PrivateBooking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('private_bookings')
    .select('*')
    .eq('userid', user.id)
    .order('scheduledat', { ascending: true });

  if (error) {
    console.error('Error fetching user private bookings:', error);
    throw error;
  }

  return data || [];
}
