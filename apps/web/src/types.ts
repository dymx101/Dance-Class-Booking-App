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
  timeStart: string; // e.g., "13:00"
  timeEnd: string; // e.g., "14:00"
  date: string; // "YYYY-MM-DD"
  classroom: string; // e.g., "A教室", "B教室", "C教室"
  minPeople: number;
  bookedCount: number;
  maxCount: number;
  openBookingTime?: string; // string or undefined if open
  type: 'group' | 'private' | 'series'; // 团课, 私教, 班课
  reservedSpots?: string[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  remainingPasses: number;
  experiencePoints: number;
  totalClassesJoined: number;
  favoriteStyle: string;
  streakDays: number;
}

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: 'booked' | 'waiting' | 'cancelled' | 'attended';
  timestamp: string;
  queueNumber?: number;
}

export interface PaymentCard {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  passes: number; // 1, 10, 30 etc. - or -1 for unlimited
  validDays: number; // e.g., 30 days, 90 days, 365 days
  description: string;
  badge?: string;
}

export interface PurchaseRecord {
  id: string;
  cardId: string;
  cardName: string;
  price: number;
  passesAdded: number;
  date: string;
  stripePaymentId?: string;
}

export interface ClassTemplate {
  id: string;
  title: string;
  genre: 'hiphop' | 'jazz' | 'urban' | 'contemporary' | 'house' | 'kpop' | 'heels';
  dayOfWeek: number; // 0-6
  timeStart: string; // "HH:MM"
  timeEnd: string; // "HH:MM"
  teacherId: string;
  teacher?: Teacher;
  difficulty: number;
  classroom: string;
  minPeople: number;
  maxCount: number;
  type: 'group' | 'private' | 'series';
  isActive: boolean;
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

