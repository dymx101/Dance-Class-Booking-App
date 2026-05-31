import React, { useState, useEffect } from 'react';
import { DanceClass, PurchaseRecord, Notification, PrivateBooking } from '@dance-app/shared';
import { 
  Award, Clock, History, Ban, User, Layers, ShieldCheck, Ticket, 
  BarChart3, HelpCircle, Flame, Mail, Trash2, CheckCircle2, ChevronRight,
  UserCheck, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { cancelPrivateSession, getUserPrivateBookings } from '../lib/coaching';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  onSuggestTab: (tabName: 'schedule' | 'store' | 'profile') => void;
  onEnterAdmin: () => void;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onRefresh?: () => void;
}

const BOOKING_ERRORS: Record<string, string> = {
  'booking_not_found': '未找到预约记录 (Booking not found)',
  'late_cancellation': '已超过取消时间，课次不予退回 (Late cancellation, no refund)',
  'already_cancelled': '该预约已取消 (Already cancelled)',
  'default': '操作失败，请重试 (Action failed)'
};

export default function ProfileView({ 
  onSuggestTab, 
  onEnterAdmin, 
  addToast,
  onRefresh
}: ProfileViewProps) {
  const { user, profile, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeSegment, setActiveTab] = useState<'bookings' | 'private' | 'history' | 'notifications'>('bookings');
  const [cancellingIds, setCancellingIds] = useState<string[]>([]);
  
  // Real data state for bookings
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [privateBookings, setPrivateBookings] = useState<PrivateBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.name === 'Admin' || user?.email?.includes('admin');

  useEffect(() => {
    if (user) {
      fetchUserHistory();
    }
  }, [user]);

  async function fetchUserHistory() {
    setLoading(true);
    try {
      // 1. Fetch Group Bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, class:class_instances(*, teacher:teachers(*))')
        .eq('userid', user?.id)
        .order('timestamp', { ascending: false });

      // 2. Fetch Private Bookings
      const privates = await getUserPrivateBookings();

      setUserBookings(bookings || []);
      setPrivateBookings(privates);
    } catch (err) {
      console.error('Error fetching user history:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingIds(prev => [...prev, bookingId]);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId
      });

      if (rpcError) {
        addToast(BOOKING_ERRORS[rpcError.message] || BOOKING_ERRORS['default'], 'error');
      } else {
        const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        if (result?.success) {
          addToast(result.refunded ? '预约已取消，课次已退回' : '预约已取消，由于是过时取消，课次不予退回', result.refunded ? 'success' : 'info');
          fetchUserHistory();
          onRefresh?.();
        }
      }
    } catch (err) {
      addToast('系统繁忙', 'error');
    } finally {
      setCancellingIds(prev => prev.filter(id => id !== bookingId));
    }
  };

  const handleCancelPrivate = async (bookingId: string) => {
    setCancellingIds(prev => [...prev, bookingId]);
    try {
      const result = await cancelPrivateSession(bookingId);
      if (result.success) {
        addToast(result.refunded ? '私教预约已取消，课次已退回' : '私教预约已取消 (过时取消不予退回)', result.refunded ? 'success' : 'info');
        fetchUserHistory();
        onRefresh?.();
      } else {
        addToast(BOOKING_ERRORS[result.error] || result.error || '取消失败', 'error');
      }
    } catch (err) {
      addToast('操作失败', 'error');
    } finally {
      setCancellingIds(prev => prev.filter(id => id !== bookingId));
    }
  };

  const currentBookings = userBookings.filter(b => b.status === 'booked' || b.status === 'waiting');
  const pastBookings = userBookings.filter(b => b.status === 'attended' || b.status === 'no_show' || b.status === 'cancelled');

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 pb-24 pt-12 bg-[#FAF8F5]">
      {/* User Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#f2ede4] mb-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <img 
              src={profile?.avatar} 
              alt={profile?.name}
              className="w-24 h-24 rounded-[2rem] object-cover border-4 border-[#FAF8F5] shadow-lg group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
              <Award className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.name || '新成员'}</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{profile?.phone}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-tight border border-rose-100 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                V2 Level • {profile?.experiencepoints} XP
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tight border border-blue-100">
                Jazz Lover
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 min-w-[80px]">
              <div className="text-xl font-black text-slate-900">{profile?.remainingpasses}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">团课次</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-[1.5rem] border border-orange-100 min-w-[80px]">
              <div className="text-xl font-black text-orange-600">{profile?.privatepasses || 0}</div>
              <div className="text-[8px] font-bold text-orange-400 uppercase tracking-widest mt-1">私教次</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Segments */}
      <div className="flex space-x-1 bg-white p-1.5 rounded-2xl shadow-sm border border-[#f2ede4] mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'bookings', label: '团课预约', icon: Clock },
          { id: 'private', label: '私教预约', icon: UserCheck },
          { id: 'notifications', label: '通知中心', count: unreadCount, icon: Bell },
          { id: 'history', label: '过往记录', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-xs font-black transition-all min-w-fit ${
              activeSegment === tab.id 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeSegment === tab.id ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Clock className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold text-xs uppercase tracking-widest">加载中 Loading...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeSegment === 'bookings' && (
              <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {currentBookings.length === 0 ? (
                  <EmptyState title="暂无团课预约" desc="快去发现感兴趣的课程吧" icon={CalendarDays} action={() => onSuggestTab('schedule')} btnText="查看排课" />
                ) : (
                  currentBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} isCancelling={cancellingIds.includes(booking.id)} />
                  ))
                )}
              </motion.div>
            )}

            {activeSegment === 'private' && (
              <motion.div key="private" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {privateBookings.length === 0 ? (
                  <EmptyState title="暂无私教预约" desc="导师为你定制专属训练方案" icon={UserCheck} action={() => onSuggestTab('schedule')} btnText="找导师" />
                ) : (
                  privateBookings.map((booking) => (
                    <PrivateBookingCard key={booking.id} booking={booking} onCancel={handleCancelPrivate} isCancelling={cancellingIds.includes(booking.id)} />
                  ))
                )}
              </motion.div>
            )}

            {activeSegment === 'notifications' && (
              <motion.div key="notifs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbox</span>
                  {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] font-black text-rose-500 uppercase">全部已读 Mark All Read</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-20 opacity-30 font-black uppercase text-[10px] tracking-widest">No notifications</div>
                ) : (
                  notifications.map(n => <NotificationItem key={n.id} notification={n} onRead={() => markAsRead(n.id)} />)
                )}
              </motion.div>
            )}

            {activeSegment === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {pastBookings.length === 0 ? <div className="text-center py-10 opacity-30 text-xs font-bold uppercase">无历史记录</div> : pastBookings.map(b => <BookingCard key={b.id} booking={b} isPast />)}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Admin Quick Entry */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 pt-8 border-t border-slate-200">
          <button onClick={onEnterAdmin} className="w-full group flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl hover:bg-black transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-rose-500"><ShieldCheck className="w-6 h-6" /></div>
              <div className="text-left">
                <h4 className="text-sm font-black uppercase tracking-tight">Studio Admin Panel</h4>
                <p className="text-[10px] text-slate-400 font-bold">Manage schedule, teachers & analytics</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>
      )}

      {/* Logout Button */}
      <div className="mt-8 px-4">
        <button onClick={signOut} className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors">切换、退出账号 Sign Out</button>
      </div>
    </div>
  );
}

// Sub-components
function EmptyState({ title, desc, icon: Icon, action, btnText }: any) {
  return (
    <div className="text-center py-16 px-8 bg-white rounded-[2rem] border border-[#f2ede4] shadow-sm">
      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300"><Icon className="w-8 h-8" /></div>
      <h3 className="text-sm font-black text-slate-800">{title}</h3>
      <p className="text-[10px] font-bold text-slate-400 mt-1 mb-6">{desc}</p>
      <button onClick={action} className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">{btnText}</button>
    </div>
  );
}

function BookingCard({ booking, onCancel, isCancelling, isPast }: any) {
  const cls = booking.class;
  const isWaiting = booking.status === 'waiting';
  
  return (
    <div className={`bg-white rounded-3xl p-5 border shadow-sm transition-all ${isPast ? 'opacity-60 grayscale' : 'border-[#f2ede4] hover:shadow-md'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
           <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${isWaiting ? 'bg-amber-100 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
             {isWaiting ? '候补中' : '预约成功'}
           </div>
           {booking.status === 'no_show' && <div className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-100 text-slate-500">未到场</div>}
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cls.date}</span>
      </div>
      <div className="flex items-center gap-4">
        <img src={cls.teacher?.avatar} className="w-12 h-12 rounded-xl object-cover" />
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 leading-tight">{cls.title}</h4>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{cls.timestart} - {cls.timeend} • {cls.teacher?.name}</p>
        </div>
        {!isPast && (
          <button 
            onClick={() => onCancel(booking.id)}
            disabled={isCancelling}
            className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"
          >
            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function PrivateBookingCard({ booking, onCancel, isCancelling }: { booking: PrivateBooking, onCancel: (id: string) => void, isCancelling: boolean }) {
  const statusColors: any = {
    requested: 'bg-blue-50 text-blue-600 border-blue-100',
    confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    completed: 'bg-slate-50 text-slate-400 border-slate-100',
    cancelled: 'bg-rose-50 text-rose-400 border-rose-100'
  };

  const statusLabels: any = {
    requested: '已提交申请',
    confirmed: '预约已确认',
    completed: '课程已结束',
    cancelled: '已取消'
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#f2ede4] shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className={`px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-wider ${statusColors[booking.status]}`}>
          {statusLabels[booking.status]}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
          <Timer className="w-3.5 h-3.5" />
          <span>{new Date(booking.scheduledat).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
           <UserCheck className="w-7 h-7" />
        </div>
        <div className="flex-1">
           <h4 className="text-sm font-black text-slate-900">Private Session w/ Teacher</h4>
           <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
             {new Date(booking.scheduledat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 60 min
           </p>
        </div>
        
        {(booking.status === 'requested' || booking.status === 'confirmed') && (
          <button 
            onClick={() => onCancel(booking.id)}
            disabled={isCancelling}
            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
          >
            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {booking.notes && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-[10px] text-slate-500 leading-relaxed">
          "{booking.notes}"
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onRead }: any) {
  return (
    <div 
      onClick={!notification.isread ? onRead : undefined}
      className={`p-5 rounded-[2rem] border transition-all ${
        notification.isread ? 'bg-white opacity-50' : 'bg-rose-50 border-rose-100 cursor-pointer shadow-sm'
      }`}
    >
      <div className="flex gap-4">
        <div className={`p-3 rounded-2xl ${notification.isread ? 'bg-slate-100 text-slate-400' : 'bg-rose-500 text-white'}`}>
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-xs font-black text-slate-800">{notification.title}</h4>
            <span className="text-[8px] font-bold text-slate-400 font-mono">
              {new Date(notification.createdat).toLocaleDateString()}
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
        </div>
      </div>
    </div>
  );
}

// Minimal placeholder
const CalendarDays = () => <div />;
