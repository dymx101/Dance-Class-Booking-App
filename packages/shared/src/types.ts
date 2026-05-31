export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  tags: string[];
  rating: number;
  description: string;
}

export interface DanceClass {
  id: string;
  title: string;
  genre: 'hiphop' | 'jazz' | 'urban' | 'contemporary' | 'house' | 'kpop' | 'heels';
  difficulty: number; // 1 to 5 stars
  teacher: Teacher;
  timestart: string; // e.g., "13:00"
  timeend: string; // e.g., "14:00"
  date: string; // "YYYY-MM-DD"
  classroom: string; // e.g., "A教室", "B教室", "C教室"
  minpeople: number;
  bookedcount: number;
  maxcount: number;
  openbookingtime?: string; // string or undefined if open
  type: 'group' | 'private' | 'series'; // 团课, 私教, 班课
  reservedspots?: string[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  remainingpasses: number;
  privatepasses: number;
  experiencepoints: number;
  totalclassesjoined: number;
  favoritestyle: string;
  streakdays: number;
}

export interface Booking {
  id: string;
  classid: string;
  userid: string;
  status: 'booked' | 'waiting' | 'cancelled' | 'attended';
  timestamp: string;
  queuenumber?: number;
}

export interface PaymentCard {
  id: string;
  title: string;
  price: number;
  originalprice?: number;
  passes: number; // 1, 10, 30 etc. - or -1 for unlimited
  validdays: number; // e.g., 30 days, 90 days, 365 days
  description: string;
  badge?: string;
}

export interface PurchaseRecord {
  id: string;
  cardid: string;
  cardname: string;
  price: number;
  passesadded: number;
  date: string;
  stripepaymentid?: string;
}

export interface ClassTemplate {
  id: string;
  title: string;
  genre: 'hiphop' | 'jazz' | 'urban' | 'contemporary' | 'house' | 'kpop' | 'heels';
  dayofweek: number; // 0-6
  timestart: string; // "HH:MM"
  timeend: string; // "HH:MM"
  teacherid: string;
  teacher?: Teacher;
  difficulty: number;
  classroom: string;
  minpeople: number;
  maxcount: number;
  type: 'group' | 'private' | 'series';
  isactive: boolean;
}

export type AppTheme = 'vibrant-light' | 'cool-mint' | 'midnight-cyber';

export interface Notification {
  id: string;
  userid: string;
  type: 'waitlist_promoted' | 'booking_confirmed' | 'purchase_successful' | 'class_cancelled';
  title: string;
  message: string;
  isread: boolean;
  createdat: string;
}

export interface RevenueStat {
  week: string;
  total_revenue: number;
  card_count: number;
}

export interface TeacherPerformance {
  teacher_id: string;
  teacher_name: string;
  total_bookings: number;
  total_waitlist: number;
  avg_fill_rate: number;
}

export interface HeatmapData {
  dayofweek: number;
  timestart: string;
  fill_rate: number;
}

export interface MemberStat {
  week: string;
  new_signups: number;
  active_users: number;
}

export interface StudioHealth {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  signups: {
    current: number;
    previous: number;
    growth: number;
  };
  fillrate: number;
  noshowrate: number;
}

export interface AtRiskMember {
  user_id: string;
  name: string;
  avatar: string;
  remainingpasses: number;
  last_active_date: string | null;
  days_inactive: number | null;
}

export interface TeacherAvailability {
  id: string;
  teacherid: string;
  dayofweek: number;
  timestart: string;
  timeend: string;
  createdat: string;
}

export interface PrivateBooking {
  id: string;
  userid: string;
  teacherid: string;
  scheduledat: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  duration_minutes: number;
  createdat: string;
}
