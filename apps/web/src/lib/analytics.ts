import { supabase } from './supabase';
import { RevenueStat, TeacherPerformance, HeatmapData, MemberStat, StudioHealth, AtRiskMember } from '@dance-app/shared';

/**
 * Fetches weekly revenue statistics from the view_revenue_stats view.
 */
export const getRevenueStats = async (): Promise<RevenueStat[]> => {
  const { data, error } = await supabase
    .from('view_revenue_stats')
    .select('*')
    .order('week_start', { ascending: true });
  
  if (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
  
  return (data || []).map((item: any) => ({
    week: item.week_start,
    total_revenue: item.total_revenue,
    card_count: item.purchase_count
  }));
};

/**
 * Fetches teacher performance metrics from the view_teacher_performance view.
 */
export const getTeacherPerformance = async (): Promise<TeacherPerformance[]> => {
  const { data, error } = await supabase
    .from('view_teacher_performance')
    .select('*')
    .order('avg_fill_rate', { ascending: false });
  
  if (error) {
    console.error('Error fetching teacher performance:', error);
    throw error;
  }
  
  return (data || []).map((item: any) => ({
    teacher_id: item.teacher_id,
    teacher_name: item.teacher_name,
    total_bookings: item.total_bookings,
    total_waitlist: item.total_waitlist,
    avg_fill_rate: item.avg_fill_rate
  }));
};

/**
 * Fetches attendance heatmap data from the view_attendance_heatmap view.
 */
export const getAttendanceHeatmap = async (): Promise<HeatmapData[]> => {
  const { data, error } = await supabase
    .from('view_attendance_heatmap')
    .select('*');
  
  if (error) {
    console.error('Error fetching attendance heatmap:', error);
    throw error;
  }
  
  return (data || []).map((item: any) => ({
    dayofweek: item.day_of_week,
    timestart: item.time_start,
    fill_rate: item.booking_count
  }));
};

/**
 * Fetches weekly member signup and activity stats from the view_member_stats view.
 */
export const getMemberStats = async (): Promise<MemberStat[]> => {
  const { data, error } = await supabase
    .from('view_member_stats')
    .select('*')
    .order('week_start', { ascending: true });
  
  if (error) {
    console.error('Error fetching member stats:', error);
    throw error;
  }
  
  return (data || []).map((item: any) => ({
    week: item.week_start,
    new_signups: item.new_signups,
    active_users: item.active_users
  }));
};

/**
 * Fetches overall studio health metrics via RPC.
 */
export const getStudioHealth = async (): Promise<StudioHealth> => {
  const { data, error } = await supabase.rpc('get_studio_health');
  
  if (error) {
    console.error('Error fetching studio health:', error);
    throw error;
  }
  
  return data as StudioHealth;
};

/**
 * Fetches members at risk of churning from the view_at_risk_members view.
 */
export const getAtRiskMembers = async (): Promise<AtRiskMember[]> => {
  const { data, error } = await supabase
    .from('view_at_risk_members')
    .select('*')
    .order('last_active_date', { ascending: true, nullsFirst: true });
  
  if (error) {
    console.error('Error fetching at-risk members:', error);
    throw error;
  }
  
  return data || [];
};
