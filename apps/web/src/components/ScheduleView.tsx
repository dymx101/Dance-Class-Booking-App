import React, { useState, useMemo } from 'react';
import { DanceClass, Teacher } from '../types';
import { TEACHERS } from '../data';
import { Calendar, Filter, ChevronLeft, ChevronRight, CheckCircle2, Layers, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SpotSelector from './SpotSelector';

const BOOKING_ERRORS: Record<string, string> = {
  'Insufficient passes': '课次余额不足 (Insufficient passes)',
  'insufficient_passes': '课次余额不足 (Insufficient passes)',
  'Late cancellation': '已超过取消时间，课次不予退回 (Late cancellation, no refund)',
  'late_cancellation': '已超过取消时间，课次不予退回 (Late cancellation, no refund)',
  'Class has already started or passed': '课程已开始或已结束 (Class has started/passed)',
  'Already booked or waiting': '您已预约或在候补名单中 (Already booked/waiting)',
  'default': '操作失败，请重试 (Action failed, please try again)'
};

interface ScheduleViewProps {
  theme?: string;
  classes: DanceClass[];
  userPasses: number;
  bookedClassIds: string[];
  waitlistClassIds: string[];
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onRefresh?: () => Promise<void>;
  bookedSpots?: Record<string, string>;
}

const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function ScheduleView({
  theme = 'vibrant-light',
  classes,
  userPasses,
  bookedClassIds,
  waitlistClassIds,
  addToast,
  onRefresh,
  bookedSpots = {}
}: ScheduleViewProps) {
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  // Compute theme dependent layout classes
  const bgClass = isDark ? 'bg-[#0c0d14]' : isMint ? 'bg-[#F0F2FA]' : 'bg-[#FAF8F5]';
  const headerBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/65' : 'border-orange-100/30';
  const textTitleClass = isDark ? 'text-[#f8fafc]' : 'text-slate-900';
  const textDescClass = isDark ? 'text-zinc-500' : 'text-slate-500';
  const textWhite = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-slate-600';
  const textZincHighlight = isDark ? 'text-zinc-300' : 'text-slate-700';

  const cardBgClass = isDark ? 'bg-[#13141f] border-white/5 text-white' : isMint ? 'bg-white border-slate-200/50 text-slate-800 shadow-sm' : 'bg-white border-[#f2ede4] text-slate-800 shadow-sm';
  const cardBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/50' : 'border-[#f2ede4]';
  const highlightText = isMint ? 'text-teal-600' : 'text-rose-500';
  const iconColor = isMint ? 'text-teal-500' : 'text-rose-500';

  const badgeClass = isDark
    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
    : isMint
    ? 'bg-teal-500/10 border border-teal-555 border-teal-500/20 text-teal-600'
    : 'bg-rose-50 border border-rose-100 text-rose-605 text-rose-600';

  const defaultButtonClass = isMint
    ? 'bg-teal-600 hover:bg-teal-750 hover:bg-teal-750 text-white shadow shadow-teal-550/10'
    : 'bg-rose-500 hover:bg-rose-600 text-white shadow shadow-rose-550/10';

  const ctaBtnColor = isMint
    ? 'bg-teal-600 hover:bg-teal-700 text-white'
    : 'bg-rose-500 hover:bg-rose-600 text-white';

  const activeToggleColor = isMint ? 'bg-teal-600 text-white shadow-md' : 'bg-rose-500 text-white shadow-md';
  const selectBgPill = isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-200/40 border border-slate-300/30';

  const activeSliderBtn = isMint ? 'bg-teal-600 text-white shadow' : 'bg-rose-500 text-white shadow';
  const inactiveSliderBtn = isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60';

  // Current mode: 'day' (日课表) or 'week' (周课表)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const { user } = useAuth();
  const [mutatingClassId, setMutatingClassId] = useState<string | null>(null);

  // Currently selected date for Daily view (Initialized to today: 2026-05-25)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-05-25');

  // Course type selected: 'group' (团课) | 'private' (私教) | 'series' (班课)
  const [activeCourseType, setActiveCourseType] = useState<'group' | 'private' | 'series'>('group');

  // Toggle "可约" (Bookable Only)
  const [onlyBookable, setOnlyBookable] = useState<boolean>(false);

  // States for Modals
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Confirmation Modal & Spot selector states
  const [selectedClassForBooking, setSelectedClassForBooking] = useState<DanceClass | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  // Filter conditions
  const [filterRoom, setFilterRoom] = useState<string>('全部教室');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('全部老师');

  // Temporary filter configurations in drawer
  const [tempRoom, setTempRoom] = useState<string>('全部教室');
  const [tempTeacherId, setTempTeacherId] = useState<string>('全部老师');

  // Weekly view date range tracker (starts on week of May 25th)
  // Let's create columns for: Mon May 25 to Sun May 31
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date('2026-05-25'));

  // Static options for Classrooms based on real classes
  const classroomsList = ['全部教室', 'A教室', 'B教室', 'C教室'];

  // Current local simulated time context: 2026-05-25T15:14:25Z
  const CURRENT_HOUR = 15;
  const CURRENT_MINUTE = 14;

  // Horizontal date Carousel dates (May 24 to June 2)
  const CAROUSEL_DATES = useMemo(() => {
    return [
      { name: '周六', dateStr: '2026-05-24', displayDate: '24', isToday: false },
      { name: '周日', dateStr: '2026-05-25', displayDate: '今', isToday: true },
      { name: '周一', dateStr: '2026-05-26', displayDate: '26', isToday: false },
      { name: '周二', dateStr: '2026-05-27', displayDate: '27', isToday: false },
      { name: '周三', dateStr: '2026-05-28', displayDate: '28', isToday: false },
      { name: '周四', dateStr: '2026-05-29', displayDate: '29', isToday: false },
      { name: '周五', dateStr: '2026-05-30', displayDate: '30', isToday: false },
      { name: '周六', dateStr: '2026-05-31', displayDate: '31', isToday: false },
      { name: '周日', dateStr: '2026-06-01', displayDate: '01', isToday: false },
      { name: '周一', dateStr: '2026-06-02', displayDate: '02', isToday: false },
    ];
  }, []);

  // Filtered classes logic for list
  const finalFilteredClasses = useMemo(() => {
    return classes.filter((item) => {
      // 1. Filter by date in Daily, or search by type
      if (item.date !== selectedDateStr) return false;

      // 2. Filter by Course type (团课, 私教, 班课)
      if (item.type !== activeCourseType) return false;

      // 3. Toggle "可约" (Only Bookable)
      if (onlyBookable) {
        // If course is already passed, it is not bookable.
        const isPassed = isClassPassed(item);
        if (isPassed) return false;

        // If booking not open yet
        if (item.openBookingTime) return false;

        // If fully booked & no spots and user is not already booked
        if (item.bookedCount >= item.maxCount && !bookedClassIds.includes(item.id)) {
          return false;
        }
      }

      // 4. Filter by Classroom
      if (filterRoom !== '全部教室' && item.classroom !== filterRoom) {
        return false;
      }

      // 5. Filter by Teacher
      if (filterTeacherId !== '全部老师' && item.teacher.id !== filterTeacherId) {
        return false;
      }

      return true;
    });
  }, [classes, selectedDateStr, activeCourseType, onlyBookable, filterRoom, filterTeacherId, bookedClassIds]);

  // Check if a class has ended based on mock current time
  function isClassPassed(cls: DanceClass): boolean {
    const todayStr = '2026-05-25';
    if (cls.date < todayStr) return true;
    if (cls.date > todayStr) return false;

    // Same day: 2026-05-25, check time
    const [startH, startM] = cls.timeStart.split(':').map(Number);
    if (startH < CURRENT_HOUR) return true;
    if (startH === CURRENT_HOUR && startM < CURRENT_MINUTE) return true;
    return false;
  }

  // Handle Booking
  const handleBookingToggle = async (clsId: string) => {
    if (!user) {
      addToast('请先登录系统！', 'error');
      return;
    }
    
    const cls = classes.find(c => c.id === clsId);
    if (!cls) return;

    if (mutatingClassId) return;

    const isAlreadyBooked = bookedClassIds.includes(clsId);

    try {
      if (isAlreadyBooked) {
        setMutatingClassId(clsId);
        // 1. Unbook / Cancellation
        const { data: bookingData, error: findError } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('classId', clsId)
          .eq('userId', user.id)
          .in('status', ['booked', 'waiting'])
          .single();

        if (findError || !bookingData) {
          addToast('未找到您的预约记录！', 'error');
          setMutatingClassId(null);
          return;
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_booking', {
          p_booking_id: bookingData.id
        });

        if (rpcError) {
          const errorMsg = BOOKING_ERRORS[rpcError.message] || rpcError.message || BOOKING_ERRORS['default'];
          addToast(errorMsg, 'error');
          setMutatingClassId(null);
          return;
        }

        const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;

        if (result && result.success) {
          if (result.refunded) {
            addToast(`已成功取消 《${cls.title}》 的预约，1课次已被退回！`, 'info');
          } else {
            addToast(BOOKING_ERRORS['late_cancellation'], 'error');
          }

          // Fetch fresh server state to guarantee synchrony
          if (onRefresh) {
            await onRefresh();
          }
        } else {
          const errCode = result?.error || 'default';
          addToast(BOOKING_ERRORS[errCode] || BOOKING_ERRORS['default'], 'error');
        }
      } else {
        // 2. Intercept unbooked class - Open Confirmation & Spot selector instead of booking immediately
        if (cls.bookedCount >= cls.maxCount) {
          addToast('抱歉，该课程名额已满。您可以选择"排队"进行预约。', 'error');
          return;
        }

        if (userPasses < 1) {
          addToast(BOOKING_ERRORS['insufficient_passes'], 'error');
          return;
        }

        setSelectedClassForBooking(cls);
        setSelectedSpot(null);
      }
    } catch (err: any) {
      console.error('Booking toggle unexpected error:', err);
      addToast(BOOKING_ERRORS['default'], 'error');
    } finally {
      setMutatingClassId(null);
    }
  };

  // Handle Confirm Booking with Spot
  const handleConfirmBookingWithSpot = async () => {
    if (!selectedClassForBooking || !selectedSpot) {
      addToast('请选择一个位置以继续预约！', 'error');
      return;
    }

    const cls = selectedClassForBooking;
    const clsId = cls.id;

    if (mutatingClassId) return;
    setMutatingClassId(clsId);

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('book_class', {
        p_instance_id: clsId,
        p_spot_number: selectedSpot
      });

      if (rpcError) {
        const errorMsg = BOOKING_ERRORS[rpcError.message] || rpcError.message || BOOKING_ERRORS['default'];
        addToast(errorMsg, 'error');
        setMutatingClassId(null);
        return;
      }

      const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;

      if (result && result.success) {
        if (result.status === 'booked') {
          addToast(`预约成功！已为您锁定 ${selectedSpot} 号位，准时开课见！`, 'success');
        } else if (result.status === 'waiting') {
          addToast(`已加入候补，位置已被冻结。`, 'success');
        }

        if (onRefresh) {
          await onRefresh();
        }

        // Close modal
        setSelectedClassForBooking(null);
        setSelectedSpot(null);
      } else {
        const errCode = result?.error || 'default';
        addToast(BOOKING_ERRORS[errCode] || BOOKING_ERRORS['default'], 'error');
      }
    } catch (err) {
      console.error('Confirm booking unexpected error:', err);
      addToast(BOOKING_ERRORS['default'], 'error');
    } finally {
      setMutatingClassId(null);
    }
  };

  // Handle Waitlist Queue Toggle
  const handleWaitlistToggle = async (clsId: string) => {
    if (!user) {
      addToast('请先登录系统！', 'error');
      return;
    }

    const cls = classes.find(c => c.id === clsId);
    if (!cls) return;

    if (mutatingClassId) return;

    const isWaiting = waitlistClassIds.includes(clsId);

    setMutatingClassId(clsId);

    try {
      if (isWaiting) {
        // 1. Leave Waitlist (cancel booking)
        const { data: bookingData, error: findError } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('classId', clsId)
          .eq('userId', user.id)
          .in('status', ['booked', 'waiting'])
          .single();

        if (findError || !bookingData) {
          addToast('未找到您的排队候补记录！', 'error');
          setMutatingClassId(null);
          return;
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_booking', {
          p_booking_id: bookingData.id
        });

        if (rpcError) {
          const errorMsg = BOOKING_ERRORS[rpcError.message] || rpcError.message || BOOKING_ERRORS['default'];
          addToast(errorMsg, 'error');
          setMutatingClassId(null);
          return;
        }

        const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;

        if (result && result.success) {
          if (result.refunded) {
            addToast(`已取消 《${cls.title}》 的排队候补，已返还1课次！`, 'info');
          } else {
            addToast(BOOKING_ERRORS['late_cancellation'], 'error');
          }

          if (onRefresh) {
            await onRefresh();
          }
        } else {
          const errCode = result?.error || 'default';
          addToast(BOOKING_ERRORS[errCode] || BOOKING_ERRORS['default'], 'error');
        }
      } else {
        // 2. Join Waitlist
        if (userPasses < 1) {
          addToast('排队也需要冻结1个课次，请先在商城充值。', 'error');
          setMutatingClassId(null);
          return;
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('book_class', {
          p_instance_id: clsId
        });

        if (rpcError) {
          const errorMsg = BOOKING_ERRORS[rpcError.message] || rpcError.message || BOOKING_ERRORS['default'];
          addToast(errorMsg, 'error');
          setMutatingClassId(null);
          return;
        }

        const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;

        if (result && result.success) {
          if (result.status === 'booked') {
            addToast(`预约成功！《${cls.title}》已腾出位置，您已成功上车。`, 'success');
          } else if (result.status === 'waiting') {
            addToast(`您已经加入《${cls.title}》 候补排队。若有位置将自动转入并短信通知您！`, 'success');
          }

          if (onRefresh) {
            await onRefresh();
          }
        } else {
          const errCode = result?.error || 'default';
          addToast(BOOKING_ERRORS[errCode] || BOOKING_ERRORS['default'], 'error');
        }
      }
    } catch (err: any) {
      console.error('Waitlist toggle unexpected error:', err);
      addToast(BOOKING_ERRORS['default'], 'error');
    } finally {
      setMutatingClassId(null);
    }
  };

  // Drawer Action Triggers
  const openFilterDrawer = () => {
    setTempRoom(filterRoom);
    setTempTeacherId(filterTeacherId);
    setIsFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setFilterRoom(tempRoom);
    setFilterTeacherId(tempTeacherId);
    setIsFilterOpen(false);
    addToast('筛选条件已启用', 'info');
  };

  const resetDrawerFilters = () => {
    setTempRoom('全部教室');
    setTempTeacherId('全部老师');
    setFilterRoom('全部教室');
    setFilterTeacherId('全部老师');
    setIsFilterOpen(false);
    addToast('筛选条件已重置', 'info');
  };

  // Calculate full week grid list for the Weekly Scheduler view
  const weeklyGridDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push({
        dateStr: `${year}-${month}-${day}`,
        dayLabel: WEEK_NAMES[d.getDay()],
        dayNum: `${month}-${day}`
      });
    }
    return dates;
  }, [currentWeekStart]);

  // Navigate week forward or backward
  const handleWeekChange = (offset: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + offset * 7);
    setCurrentWeekStart(newStart);
  };

  // Calendar click date selection handler
  const handleCalendarPickDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsCalendarOpen(false);
    addToast(`已跳转至 ${dateStr} 课表`, 'info');
  };

  // Get difficulty stars UI
  const renderStars = (diffVal: number) => {
    return (
      <span className="flex text-amber-500 text-xs ml-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-[10px]">
            {i < diffVal ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className={`flex-1 overflow-y-auto px-4 pb-20 pt-4 transition-colors duration-500 ${bgClass}`} id="schedule-container">
      {/* Header section with PLANA selection and Tab slider */}
      <div className={`flex items-center justify-between pb-3 border-b ${headerBorder} mb-3`}>
        <div className="flex items-center space-x-2" id="studio-selector">
          <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${isMint ? 'from-teal-400 to-emerald-500' : 'from-pink-500 to-rose-600'} flex items-center justify-center text-white text-[10px] font-black tracking-tighter`}>
            P
          </div>
          <span className={`font-extrabold text-xs ${textTitleClass}`}>武汉街道口旗舰店</span>
        </div>

        {/* Day / Week scheduler toggle tabs */}
        <div className={`${selectBgPill} p-0.5 rounded-full flex text-[10px] font-black`} id="mode-selector">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              viewMode === 'day'
                ? activeToggleColor
                : isDark ? 'text-zinc-405 text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            日课表
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              viewMode === 'week'
                ? activeToggleColor
                : isDark ? 'text-zinc-405 text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            周课表
          </button>
        </div>
      </div>

      {viewMode === 'day' ? (
        /* =================== DAILY VIEW INTERFACE =================== */
        <div>
          {/* Main Course filters: Group (团课) | Private (私教) | Series (班课) */}
          <div className="flex items-center justify-between mt-2 mb-2.5">
            <div className={`${selectBgPill} p-1 rounded-xl flex space-x-1 shrink-0`}>
              <button
                onClick={() => setActiveCourseType('group')}
                className={`text-[11px] px-3.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                  activeCourseType === 'group'
                    ? activeSliderBtn
                    : inactiveSliderBtn
                }`}
                id="btn-group-class"
              >
                团课
              </button>
              <button
                onClick={() => setActiveCourseType('private')}
                className={`text-[11px] px-3.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                  activeCourseType === 'private'
                    ? activeSliderBtn
                    : inactiveSliderBtn
                }`}
                id="btn-private-class"
              >
                私教
              </button>
              <button
                onClick={() => setActiveCourseType('series')}
                className={`text-[11px] px-3.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                  activeCourseType === 'series'
                    ? activeSliderBtn
                    : inactiveSliderBtn
                }`}
                id="btn-series-class"
              >
                班课
              </button>
            </div>

            {/* Quick action actions: Bookable switch & Month Calendar Icon */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer select-none" id="toggle-bookable">
                <span className={`text-[11px] font-extrabold mr-1.5 ${textSecondary}`}>可约</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={onlyBookable}
                    onChange={(e) => setOnlyBookable(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-4.5 rounded-full transition-colors ${
                    onlyBookable 
                      ? (isMint ? 'bg-teal-600' : 'bg-rose-500') 
                      : (isDark ? 'bg-zinc-800' : 'bg-slate-300')
                  }`}></div>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${onlyBookable ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                </div>
              </label>

              <button
                onClick={() => setIsCalendarOpen(true)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                  isDark 
                    ? 'border-white/5 bg-white/5 text-zinc-300 hover:text-rose-455 hover:bg-white/10' 
                    : 'border-slate-200 bg-white text-slate-750 text-slate-700 hover:text-rose-500 hover:bg-slate-50'
                }`}
                title="选择日期"
                id="btn-open-calendar"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrolling dates carousel row */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mt-2 -mx-4 px-4 scrollbar-none" id="date-carousel">
            {CAROUSEL_DATES.map((item) => {
              const isSelected = selectedDateStr === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-11 transition-all cursor-pointer ${
                    isSelected
                      ? isMint 
                        ? 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-lg border-b-2 border-teal-300 scale-105 font-bold'
                        : 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg border-b-2 border-rose-400 scale-105 font-bold'
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/5 font-semibold'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60 shadow-xs font-semibold'
                  }`}
                >
                  <span className={`text-[9px] font-extrabold ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs font-black mt-0.5">
                    {item.displayDate}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter button and label summaries */}
          <div className="flex items-center justify-between mt-3 mb-2 px-0.5">
            <div className={`text-[10px] font-bold tracking-wide ${textSecondary}`}>
              {(filterRoom !== '全部教室' || filterTeacherId !== '全部老师') ? (
                <span className={`${badgeClass} flex items-center px-2.5 py-0.5 rounded-full`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-ping ${isMint ? 'bg-teal-550' : 'bg-rose-500'}`}></span>
                  已筛选: {filterRoom} • {filterTeacherId !== '全部老师' ? TEACHERS.find(t=>t.id===filterTeacherId)?.name : '全部老师'}
                </span>
              ) : (
                <span>全部课程计划列表</span>
              )}
            </div>

            <button
              onClick={openFilterDrawer}
              className={`flex items-center text-[11px] px-3 py-1 border rounded-full font-black shadow-sm cursor-pointer transition-colors ${
                isDark 
                  ? 'text-zinc-300 hover:text-rose-455 hover:bg-white/10 bg-[#13141f] border-white/5' 
                  : isMint 
                  ? 'text-teal-700 bg-teal-50 hover:bg-teal-100/55 border-teal-200/50' 
                  : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
              }`}
              id="btn-filter-drawer"
            >
              <Filter className={`w-3 h-3 mr-1 ${highlightText}`} />
              <span>筛选</span>
            </button>
          </div>

          {/* Cards List container with Empty Stage conditions */}
          <div className="space-y-3 mt-2" id="daily-classes-list">
            {finalFilteredClasses.length === 0 ? (
              <div className={`${cardBgClass} rounded-[32px] p-8 border text-center flex flex-col items-center justify-center shadow-lg`} id="empty-state">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                  <Layers className={`w-6 h-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
                </div>
                <p className={`font-extrabold text-sm ${textWhite}`}>暂无课程信息，先看看别的吧</p>
                <p className={`text-xs mt-1.5 mb-4 font-bold font-mono ${textSecondary}`}>最近可约项目为: 2026-05-25 (今日)</p>
                <button
                  onClick={() => {
                    setSelectedDateStr('2026-05-25');
                    setFilterRoom('全部教室');
                    setFilterTeacherId('全部老师');
                    setActiveCourseType('group');
                  }}
                  className={`px-5 py-2.5 text-white rounded-full text-xs font-black shadow-lg cursor-pointer transition duration-300 ${defaultButtonClass}`}
                  id="btn-back-to-today"
                >
                  立即预约 (看今天大课)
                </button>
              </div>
            ) : (
              finalFilteredClasses.map((cls) => {
                const ended = isClassPassed(cls);
                const isBooked = bookedClassIds.includes(cls.id);
                const isWaiting = waitlistClassIds.includes(cls.id);
                const isFull = cls.bookedCount >= cls.maxCount;

                return (
                  <div
                    key={cls.id}
                    className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${cardBgClass} ${
                      isBooked
                        ? isMint 
                          ? 'border-teal-500 shadow-md bg-teal-500/5' 
                          : 'border-rose-500 shadow-md bg-rose-500/5'
                        : isWaiting
                        ? 'border-violet-500 shadow-md bg-violet-500/5'
                        : `shadow-sm ${headerBorder}`
                    }`}
                  >
                    {/* Top cyan hour panel tag */}
                    <div className={`px-4 py-1.5 border-b flex items-center justify-between ${isDark ? 'bg-[#181926]/90 border-white/5' : 'bg-slate-100/70 border-slate-200/55'}`}>
                      <span className={`text-xs font-black font-mono ${highlightText}`}>
                        {cls.timeStart} ~ {cls.timeEnd}
                      </span>
                      <span className={`text-[9px] uppercase font-black tracking-widest font-mono ${isDark ? 'text-rose-300' : 'text-slate-650 text-slate-500'}`}>
                        {cls.genre} Style
                      </span>
                    </div>

                    <div className="p-4 flex items-start space-x-3.5">
                      {/* Teacher Round Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={cls.teacher.avatar}
                          alt={cls.teacher.name}
                          className={`w-12 h-12 rounded-2xl object-cover border ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute -bottom-1 -right-1 text-white text-[8px] px-1 rounded font-black border ${activeToggleColor} ${isDark ? 'border-[#13141f]' : 'border-white'}`}>
                          {cls.teacher.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Main Center specs of Class */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <h3 className={`font-extrabold text-sm tracking-tight truncate leading-tight ${textWhite}`}>
                            {cls.title}
                          </h3>
                        </div>

                        {/* Dance genre text styled */}
                        <div className="flex items-center text-xs mt-1 space-x-1 font-sans font-medium">
                          <span className={`font-bold ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{cls.teacher.name}</span>
                          <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>•</span>
                          <span className={`capitalize ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{cls.genre}</span>
                          <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>•</span>
                          <span className="flex items-center">
                            难度 {renderStars(cls.difficulty)}
                          </span>
                        </div>

                        {/* Booking classroom and capacity ratios */}
                        <div className={`text-[11px] mt-1 font-mono space-y-0.5 font-bold ${textSecondary}`}>
                          <div>{cls.classroom} • 满{cls.minPeople}人开课</div>
                          <div className="flex items-center mt-1">
                            <span className="mr-1.5">已预约:</span>
                            <span className={`font-black ${isFull ? highlightText : (isDark ? 'text-zinc-200' : 'text-slate-800')}`}>
                              {cls.bookedCount}
                            </span>
                            <span className={`${isDark ? 'text-zinc-650 text-zinc-600' : 'text-slate-400'} mx-0.5`}>/</span>
                            <span>{cls.maxCount}人</span>

                            {isFull && (
                              <span className={`ml-2 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded leading-none ${badgeClass}`}>
                                满员候补
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Side Actions buttons */}
                      <div className="shrink-0 flex flex-col justify-center items-end h-full self-center">
                        {ended ? (
                          <div className={`text-[11px] px-4 py-2 rounded-full font-bold select-none cursor-not-allowed border ${
                            isDark ? 'bg-zinc-800 text-zinc-500 border-white/5' : 'bg-slate-205 bg-slate-200 text-slate-400 border-slate-300/30'
                          }`}>
                            已结束
                          </div>
                        ) : cls.openBookingTime ? (
                          <div className="flex flex-col items-end">
                            <span className={`text-[8px] font-extrabold mb-1 font-mono px-1.5 py-0.5 rounded ${
                              isMint ? 'bg-teal-500/10 text-teal-605 text-teal-500 border border-teal-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            }`}>
                              {cls.openBookingTime}
                            </span>
                            <button
                              disabled
                              className={`text-xs px-4 py-2 rounded-full font-black opacity-70 cursor-not-allowed border ${
                                isDark ? 'bg-zinc-800/50 text-zinc-600 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-205 border-slate-200'
                              }`}
                            >
                              待开启
                            </button>
                          </div>
                        ) : isBooked ? (
                          <button
                            disabled={mutatingClassId !== null}
                            onClick={() => handleBookingToggle(cls.id)}
                            className={`border active:scale-95 text-xs px-3.5 py-2 rounded-full font-black transition flex items-center space-x-1 ${
                              mutatingClassId !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              isMint 
                                ? 'bg-teal-500/10 hover:bg-teal-500/25 border-teal-500/20 text-teal-600' 
                                : 'bg-rose-500/10 hover:bg-rose-500/25 border-rose-500/20 text-rose-500 text-rose-400'
                            }`}
                          >
                            {mutatingClassId === cls.id ? (
                              <span>处理中...</span>
                            ) : (
                              <>
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isMint ? 'text-teal-600' : 'text-rose-455 text-rose-400'}`} />
                                <span>退约</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div>
                            {isFull ? (
                              <button
                                disabled={mutatingClassId !== null}
                                onClick={() => handleWaitlistToggle(cls.id)}
                                className={`text-[11px] px-4 py-2 rounded-full font-bold transition duration-250 active:scale-95 flex items-center space-x-1 ${
                                  mutatingClassId !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                } ${
                                  isWaiting
                                    ? isMint 
                                      ? 'bg-teal-500/10 border border-teal-500/20 text-teal-600' 
                                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-500 text-rose-405'
                                    : defaultButtonClass
                                }`}
                              >
                                {mutatingClassId === cls.id ? '处理中...' : isWaiting ? '候补中' : '排队'}
                              </button>
                            ) : (
                              <button
                                disabled={mutatingClassId !== null}
                                onClick={() => handleBookingToggle(cls.id)}
                                className={`active:scale-95 text-xs px-5 py-2 rounded-full font-black transition shadow-lg hover:scale-103 ${
                                  mutatingClassId !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                } ${
                                  isDark 
                                    ? 'bg-white hover:bg-zinc-100 text-[#0c0d14]' 
                                    : 'bg-slate-900 hover:bg-black text-white'
                                }`}
                              >
                                {mutatingClassId === cls.id ? '处理中...' : '预约'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ==================== WARM TIPS (温馨提示) ==================== */}
          <div className={`mt-6 p-5 rounded-[24px] border ${cardBgClass} transition-all duration-300 shadow-sm`} id="warm-tips-box">
            <h4 className={`text-xs font-black flex items-center mb-4 tracking-wider ${highlightText}`}>
              <span className={`w-2 h-2 rounded-full border-2 ${isMint ? 'border-teal-500' : 'border-rose-500'} mr-2 inline-block`}></span>
              温馨提示
            </h4>
            <div className={`space-y-3 text-[11px] font-bold leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`} id="warm-tips-list">
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>会员卡仅限本人使用</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>如非会员本人来上课，工作人员可拒绝该同学上这节课，且已约课程正常划扣</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>小程序登录后，可在“我的”找到“通知管理”设置课程预约提醒</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>街道口店常规课需提前1小时取消（手动取消）</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>小班课预约后无法取消（合理安排时间预约）</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>如课程预约满了，可点击排队，有学员取消将按排队顺序自动预约，如未排队成功将自动取消</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>排队请在开课前一个小时在公众号“已约”确认是否约上该课程</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>如未取消课程缺课，会员卡将自动划扣</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-[12px] leading-none mt-0.5">⚠️</span>
                <span>所有会员卡禁止代约课/私下转卡/买卖次数</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* =================== WEEKLY GRID SCHEDULER VIEW =================== */
        <div className="mt-3">
          {/* Week interval navigator panel */}
          <div className={`${cardBgClass} px-4 py-2.5 border rounded-[20px] mb-4 shadow-xl flex items-center justify-between`}>
            <button
              onClick={() => handleWeekChange(-1)}
              className={`p-1.5 rounded-full transition cursor-pointer ${isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              id="weekly-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className={`text-xs font-black tracking-tight font-mono ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>
              {weeklyGridDates[0].dayNum} 至 {weeklyGridDates[6].dayNum}
            </span>

            <button
              onClick={() => handleWeekChange(1)}
              className={`p-1.5 rounded-full transition cursor-pointer ${isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              id="weekly-next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Grid layout panel scrollable horizontally */}
          <div className={`${isDark ? 'bg-[#13141f] border-white/5' : 'bg-white border-slate-200'} border rounded-[24px] overflow-hidden shadow-2xl`}>
            <div className="overflow-x-auto select-none">
              <div className={`min-w-[640px] grid grid-cols-8 border-b ${isDark ? 'divide-white/5 border-white/5 bg-white/5' : 'divide-slate-250 border-slate-200 bg-slate-50'}`}>
                {/* Time header label cell */}
                <div className={`p-2 py-3 text-center text-[10px] font-black font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  时间
                </div>

                {/* 7 Columns titles of date */}
                {weeklyGridDates.map((col, idx) => {
                  const isDateSelected = selectedDateStr === col.dateStr;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDateStr(col.dateStr);
                        setViewMode('day'); // Slide back to daily of that picked list
                        addToast(`已跳转至 ${col.dateStr} 详细课表`, 'info');
                      }}
                      className={`p-2 py-3 text-center transition flex flex-col items-center justify-center hover:bg-black/5 cursor-pointer ${
                        isDateSelected 
                          ? isMint 
                            ? 'bg-teal-500/15 border-t-2 border-teal-500' 
                            : 'bg-rose-500/15 border-t-2 border-rose-500' 
                          : ''
                      }`}
                    >
                      <span className="text-[9px] text-zinc-500 block font-bold">
                        {col.dayLabel}
                      </span>
                      <span className={`text-[11px] font-black mt-0.5 ${isDateSelected ? highlightText : (isDark ? 'text-zinc-200' : 'text-slate-800')}`}>
                        {col.dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Weekly Timeline Slots Body */}
              <div className="min-w-[640px] grid grid-cols-8 divide-x divide-white/5 font-mono">
                {/* Simulated time intervals rows */}
                <div className="col-span-1 divide-y divide-white/5">
                  {['10:30', '13:00', '14:00', '15:00', '16:30', '18:30'].map((time) => (
                    <div key={time} className={`h-28 p-2 text-center flex items-center justify-center text-[10px] font-black border-b ${
                      isDark ? 'text-zinc-500 bg-white/5 border-white/5' : 'text-slate-505 text-slate-500 bg-slate-100/50 border-slate-200/50'
                    }`}>
                      {time}
                    </div>
                  ))}
                </div>

                {/* Grid cells representing dance categories slots */}
                {weeklyGridDates.map((col, colIdx) => {
                  const dayClasses = classes.filter(c => c.date === col.dateStr);

                  return (
                    <div key={colIdx} className={`col-span-1 divide-y min-h-[500px] ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                      {['10:30', '13:00', '14:00', '15:00', '16:30', '18:30'].map((timeSlot) => {
                        // Find if any class matches this general time starting slot index
                        const classMatch = dayClasses.find(c => c.timeStart === timeSlot);
                        const isBooked = classMatch ? bookedClassIds.includes(classMatch.id) : false;

                        return (
                          <div key={timeSlot} className={`h-28 p-1 relative flex flex-col justify-between border-b ${
                            isDark ? 'border-white/5 bg-[#0c0d14]' : 'border-slate-200 bg-white'
                          }`}>
                            {classMatch ? (
                              <div
                                onClick={() => {
                                  setSelectedDateStr(col.dateStr);
                                  setViewMode('day'); // Direct go to detail on click
                                  addToast(`您点击了 ${classMatch.title}，进入单日模式管理预约`, 'info');
                                }}
                                className={`w-full h-full rounded-xl p-1.5 text-left text-white leading-none cursor-pointer overflow-hidden transition-all hover:brightness-110 hover:scale-[1.02] flex flex-col justify-between border border-white/5 ${
                                  isBooked
                                    ? isMint 
                                      ? 'bg-teal-550 bg-teal-605 bg-teal-600 shadow-md shadow-teal-500/10 text-white' 
                                      : 'bg-rose-500 shadow-md shadow-rose-500/10 text-white'
                                    : classMatch.genre === 'hiphop'
                                    ? 'bg-indigo-950/90 border border-indigo-500/30 text-white'
                                    : classMatch.genre === 'jazz'
                                    ? 'bg-violet-950/90 border border-violet-500/30 text-white'
                                    : classMatch.genre === 'urban'
                                    ? 'bg-pink-950/95 border border-pink-500/30 text-white'
                                    : 'bg-zinc-900 border border-zinc-700 text-white'
                                }`}
                              >
                                <div>
                                  <div className="text-[9px] truncate font-extrabold tracking-tight">
                                    {classMatch.title}
                                  </div>
                                  <div className="text-[8px] text-zinc-350 text-zinc-300 truncate leading-none mt-1">
                                    {classMatch.timeStart}~{classMatch.timeEnd}
                                  </div>
                                  <div className="text-[8px] font-black text-rose-300 tracking-wide truncate mt-1">
                                    {classMatch.teacher.name}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                                  {isBooked ? (
                                    <span className={`bg-white text-[8px] font-black px-1 rounded truncate leading-none scale-[0.9] origin-left ${isMint ? 'text-teal-600' : 'text-rose-550 text-rose-500'}`}>
                                      已预约
                                    </span>
                                  ) : (
                                    <span className="bg-black/25 text-zinc-350 text-zinc-300 text-[8px] font-bold px-1 rounded truncate leading-none scale-[0.9] origin-left">
                                      {classMatch.bookedCount}/{classMatch.maxCount}人
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-[10px] select-none font-bold ${isDark ? 'text-zinc-800' : 'text-slate-300'}`}>
                                -
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className={`text-[9px] mt-2 text-center leading-relaxed ${textSecondary}`}>
            * 提示: 课表背色代表舞种风格。预约的项目将标高亮，点击日历对应日期或表格卡片，均可随时查看详细课程内容与退约设置。
          </p>
        </div>
      )}

      {/* ==================== SCREEN DIALOG 1: CALENDAR MODAL  ==================== */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay sheet backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            ></motion.div>

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 border text-white ${
                isDark ? 'bg-[#13141f] border-white/10 text-white' : 'bg-white border-slate-205 border-slate-200 text-slate-800'
              }`}
            >
              {/* Month selector header */}
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-[#181926] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-extrabold tracking-widest uppercase ${textSecondary}`}>月历日期选择</span>
                <span className={`text-sm font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>2026-05</span>
                <span className={`text-[9px] text-white font-black px-2 py-0.5 rounded-full font-mono uppercase ${ctaBtnColor}`}>今天</span>
              </div>

              {/* Calendar Grid mockup elements */}
              <div className="p-4" id="calendar-grid-box">
                {/* Row day labels */}
                <div className="grid grid-cols-7 text-center mb-2">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                    <span key={day} className={`text-[11px] font-bold py-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      {day}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 text-center gap-1.5 font-mono">
                  {/* Empty cells for May offset (Starts on Friday, 1st) */}
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={`empty_${idx}`} className={`text-xs py-1.5 ${isDark ? 'text-zinc-800' : 'text-slate-300'}`}>-</span>
                  ))}

                  {/* Days grid generator from 1 to 31 */}
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const dayNumStr = String(idx + 1).padStart(2, '0');
                    const fullDateStr = `2026-05-${dayNumStr}`;
                    const isToday = dayNumStr === '25';
                    const isBookableRange = idx + 1 >= 24 && idx + 1 <= 31; // Enabled only matching dates
                    const isCurrentSelected = selectedDateStr === fullDateStr;

                    return (
                      <button
                        key={idx}
                        disabled={!isBookableRange}
                        onClick={() => handleCalendarPickDate(fullDateStr)}
                        className={`text-xs py-1.5 font-bold rounded-xl transition relative cursor-pointer ${
                          isCurrentSelected
                            ? isMint 
                              ? 'bg-teal-550 bg-teal-600 text-white shadow shadow-teal-500/30'
                              : 'bg-rose-500 text-white shadow shadow-rose-500/30'
                            : isToday
                            ? isMint
                              ? 'border border-teal-555 border-teal-500 text-teal-600 bg-teal-50'
                              : 'border border-rose-500 text-rose-500 bg-rose-50'
                            : isBookableRange
                            ? isDark
                              ? 'text-zinc-305 text-zinc-300 hover:bg-white/5 hover:text-white'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            : isDark 
                            ? 'text-zinc-800 cursor-not-allowed'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {idx + 1}
                        {isToday && (
                          <span className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isMint ? 'bg-teal-500' : 'bg-rose-500'}`}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom close footer buttons */}
              <div className={`p-4 flex items-center justify-between border-t ${isDark ? 'bg-[#181926] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <button
                  onClick={() => handleCalendarPickDate('2026-05-25')}
                  className={`text-xs font-extrabold hover:underline cursor-pointer ${highlightText}`}
                >
                  回今天 (5-25)
                </button>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className={`px-4 py-1.5 border text-xs font-semibold rounded-full transition cursor-pointer ${
                    isDark ? 'bg-white/5 border-white/5 text-zinc-350 text-zinc-300 hover:text-white' : 'bg-white hover:bg-slate-100/55 border-slate-205 border-slate-200 text-slate-700'
                  }`}
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== SCREEN DIALOG 2: FILTER DRAWER  ==================== */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Drawer Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            ></motion.div>

            {/* Slider Content block */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className={`w-screen max-w-xs border-l flex flex-col shadow-2xl ${
                  isDark ? 'bg-[#13141f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Header title */}
                <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-[#181926] border-white/5 text-white' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`font-extrabold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>课程条件筛选</span>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className={`text-base font-black cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-850 hover:text-slate-800'}`}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Classroom Selector block */}
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                      教室 (Classroom)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {classroomsList.map((room) => {
                        const isSel = tempRoom === room;
                        return (
                          <button
                            key={room}
                            onClick={() => setTempRoom(room)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                              isSel
                                ? isMint 
                                  ? 'bg-teal-605 bg-teal-600 border-teal-500 text-white font-black hover:bg-teal-700 scale-103 shadow-md shadow-teal-500/10'
                                  : 'bg-rose-500 border-rose-550 text-white font-black hover:bg-rose-600 scale-103 shadow-md shadow-rose-500/10'
                                : isDark
                                ? 'bg-white/5 border-white/5 text-zinc-350 text-zinc-300 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                            }`}
                          >
                            {room}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Teachers Selector block */}
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                      老师 (Instructor)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTempTeacherId('全部老师')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                          tempTeacherId === '全部老师'
                            ? isMint 
                              ? 'bg-teal-605 bg-teal-600 border-teal-500 text-white font-black hover:bg-teal-700 scale-103'
                              : 'bg-rose-500 border-rose-550 text-white font-black hover:bg-rose-600 scale-103'
                            : isDark
                            ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                        }`}
                      >
                        全部老师
                      </button>

                      {TEACHERS.map((teacher) => {
                        const isSel = tempTeacherId === teacher.id;
                        return (
                          <button
                            key={teacher.id}
                            onClick={() => setTempTeacherId(teacher.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                              isSel
                                ? isMint 
                                  ? 'bg-teal-650 bg-teal-600 border-teal-555 text-white font-black hover:bg-teal-750 scale-103'
                                  : 'bg-rose-500 border-rose-550 text-white font-black hover:bg-rose-600 scale-103'
                                : isDark
                                ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                            }`}
                          >
                            {teacher.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Trigger controls with "重置" & "确认" */}
                <div className={`p-4 border-t grid grid-cols-2 gap-3 ${isDark ? 'border-white/5 bg-[#181926]' : 'border-slate-200 bg-slate-50/80'}`}>
                  <button
                    onClick={resetDrawerFilters}
                    className={`w-full py-2.5 text-xs font-bold rounded-full transition cursor-pointer border ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                    }`}
                  >
                    重置
                  </button>
                  <button
                    onClick={applyDrawerFilters}
                    className={`w-full py-2.5 text-white text-xs font-bold rounded-full shadow-lg transition cursor-pointer ${ctaBtnColor}`}
                  >
                    确认
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== SCREEN DIALOG 3: BOOKING CONFIRMATION & SPOT SELECTOR MODAL  ==================== */}
      <AnimatePresence>
        {selectedClassForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (mutatingClassId === null) {
                  setSelectedClassForBooking(null);
                  setSelectedSpot(null);
                }
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className={`rounded-[32px] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative z-10 border text-white overflow-hidden ${
                isDark ? 'bg-[#13141f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Header: Class Overview */}
              <div className={`p-5 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'bg-[#181926] border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Sparkles className={`w-4 h-4 ${highlightText} animate-pulse`} />
                  <span className={`text-xs font-black tracking-widest uppercase ${textSecondary}`}>
                    自主选座预约 (Classroom Spot Booking)
                  </span>
                </div>
                <button
                  disabled={mutatingClassId !== null}
                  onClick={() => {
                    setSelectedClassForBooking(null);
                    setSelectedSpot(null);
                  }}
                  className={`p-1.5 rounded-full transition-all border ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-400 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Content: Spot selector grid & details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Class details card */}
                <div className={`p-4.5 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100/50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeClass}`}>
                        {selectedClassForBooking.type === 'group' ? '精品大课' : selectedClassForBooking.type === 'private' ? '私教课' : '特别班课'}
                      </span>
                      <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedClassForBooking.title}
                      </h3>
                    </div>
                    <p className={`text-[10px] font-bold font-mono ${highlightText}`}>
                      {selectedClassForBooking.date} • {selectedClassForBooking.timeStart} ~ {selectedClassForBooking.timeEnd}
                    </p>
                    <p className={`text-[9px] font-bold ${textSecondary}`}>
                      导师: {selectedClassForBooking.teacher.name} • 课室: {selectedClassForBooking.classroom}
                    </p>
                  </div>
                  
                  {/* Teacher Avatar preview */}
                  <img
                    src={selectedClassForBooking.teacher.avatar}
                    alt={selectedClassForBooking.teacher.name}
                    className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${
                      isMint ? 'border-teal-500/30' : 'border-rose-500/30'
                    }`}
                  />
                </div>

                {/* Spot selector */}
                <SpotSelector
                  classId={selectedClassForBooking.id}
                  reservedSpots={selectedClassForBooking.reservedSpots || []}
                  selectedSpot={selectedSpot}
                  onSelectSpot={(spot) => {
                    setSelectedSpot(spot);
                  }}
                  theme={theme}
                />
              </div>

              {/* Bottom Action Footer with Pass count warning & confirm buttons */}
              <div className={`p-5 border-t shrink-0 ${
                isDark ? 'border-white/5 bg-[#181926]' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold ${textSecondary}`}>扣减费用:</span>
                    <span className={`text-xs font-black ${highlightText}`}>1 课次点数</span>
                  </div>
                  <div className="text-[10px] font-bold font-sans">
                    <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>钱包剩余: </span>
                    <span className={isDark ? 'text-white' : 'text-slate-800'}>{userPasses}次</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    disabled={mutatingClassId !== null}
                    onClick={() => {
                      setSelectedClassForBooking(null);
                      setSelectedSpot(null);
                    }}
                    className={`w-full py-3.5 text-xs font-bold rounded-full border transition cursor-pointer flex items-center justify-center ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5' 
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    取消返回
                  </button>
                  <button
                    disabled={mutatingClassId !== null || !selectedSpot}
                    onClick={handleConfirmBookingWithSpot}
                    className={`w-full py-3.5 text-white text-xs font-black rounded-full shadow-lg transition flex items-center justify-center space-x-1.5 ${
                      !selectedSpot 
                        ? 'bg-zinc-800 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-40 shadow-none' 
                        : ctaBtnColor
                    }`}
                  >
                    {mutatingClassId !== null ? (
                      <span>正在锁定...</span>
                    ) : (
                      <>
                        <span>确认选位预约</span>
                        {selectedSpot && (
                          <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded leading-none">
                            {selectedSpot}号位
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
