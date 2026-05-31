import React, { useState, useMemo, useEffect } from 'react';
import { Teacher, TeacherAvailability, TEACHERS, TEACHER_AVAILABILITY, PrivateBooking } from '@dance-app/shared';
import { ChevronLeft, Calendar, Clock, Star, ChevronRight, CheckCircle2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { requestPrivateSession, getTeacherAvailability, getTeacherPrivateBookings } from '../lib/coaching';

interface PrivateCoachingViewProps {
  theme?: string;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  privatePasses: number;
}

const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function PrivateCoachingView({
  theme = 'vibrant-light',
  addToast,
  privatePasses
}: PrivateCoachingViewProps) {
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Real data states
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>([]);
  const [existingBookings, setExistingBookings] = useState<PrivateBooking[]>([]);

  // Helper to get local date string
  const getLocalYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Theme styles
  const bgClass = isDark ? 'bg-[#0c0d14]' : isMint ? 'bg-[#F0F2FA]' : 'bg-[#FAF8F5]';
  const cardBgClass = isDark ? 'bg-[#13141f] border-white/5 text-white' : isMint ? 'bg-white border-slate-200/50 text-slate-800 shadow-sm' : 'bg-white border-[#f2ede4] text-slate-800 shadow-sm';
  const textTitleClass = isDark ? 'text-[#f8fafc]' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-slate-600';
  const highlightText = isMint ? 'text-teal-600' : 'text-rose-500';
  const activeToggleColor = isMint ? 'bg-teal-600 text-white shadow-md' : 'bg-rose-500 text-white shadow-md';
  const ctaBtnColor = isMint ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white';

  // Fetch teacher-specific data when selected
  useEffect(() => {
    if (selectedTeacher) {
      setLoadingAvailability(true);
      Promise.all([
        getTeacherAvailability(selectedTeacher.id),
        getTeacherPrivateBookings(selectedTeacher.id)
      ]).then(([avail, bookings]) => {
        setAvailabilities(avail);
        setExistingBookings(bookings);
        setLoadingAvailability(false);
      }).catch(err => {
        console.error('Error fetching teacher data:', err);
        setLoadingAvailability(false);
      });
    }
  }, [selectedTeacher]);

  // Generate next 7 days
  const next7Days = useMemo(() => {
    const dates = [];
    const today = new Date(2026, 4, 25); 
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = getLocalYYYYMMDD(d);
      dates.push({
        dateStr,
        dayName: i === 0 ? '今天' : WEEK_NAMES[d.getDay()],
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        dayOfWeek: d.getDay()
      });
    }
    return dates;
  }, []);

  // Check if a day has availability
  const isDayAvailable = (dayOfWeek: number) => {
    return availabilities.some(a => a.dayofweek === dayOfWeek);
  };

  // Generate slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedTeacher || !selectedDate) return [];
    
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const dayAvail = availabilities.find(a => a.dayofweek === dayOfWeek);
    
    if (!dayAvail) return [];

    const slots = [];
    const startHour = parseInt(dayAvail.timestart.split(':')[0]);
    const endHour = parseInt(dayAvail.timeend.split(':')[0]);

    for (let h = startHour; h < endHour; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      // Real check against existing bookings
      const isBooked = existingBookings.some(b => {
        const bDate = b.scheduledat.split('T')[0];
        const bTime = b.scheduledat.split('T')[1].substring(0, 5);
        return bDate === selectedDate && bTime === timeStr && b.status !== 'cancelled';
      });

      slots.push({
        time: timeStr,
        isBooked
      });
    }
    return slots;
  }, [selectedTeacher, selectedDate, availabilities, existingBookings]);

  const handleBook = async () => {
    if (!selectedSlot || !selectedTeacher || !selectedDate) return;
    if (privatePasses < 2) {
      addToast('私教课次不足 (需2课次)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledAt = `${selectedDate}T${selectedSlot}:00Z`;
      
      const result = await requestPrivateSession({
        teacherId: selectedTeacher.id,
        scheduledAt,
        notes: notes.trim()
      });

      if (result.success) {
        addToast(`预约申请已提交！请等待导师确认。`, 'success');
        setSelectedTeacher(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setIsModalOpen(false);
        setNotes('');
      } else {
        addToast(result.error || '预约失败，请稍后重试', 'error');
      }
    } catch (err) {
      console.error('Booking error:', err);
      addToast('系统繁忙，请稍后重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 pb-24 pt-6 ${bgClass}`}>
      <AnimatePresence mode="wait">
        {!selectedTeacher ? (
          <motion.div
            key="teacher-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className={`text-xl font-black ${textTitleClass}`}>私教预约 (Private Coaching)</h1>
                <p className={`text-xs mt-1 ${textSecondary}`}>一对一专业指导 • 针对性提升</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEACHERS.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`rounded-[24px] p-4 border cursor-pointer transition-all ${cardBgClass} hover:border-rose-500/50`}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-sm">{teacher.name}</h3>
                        <div className="flex items-center text-amber-500 text-[10px] font-black">
                          <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                          {teacher.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {teacher.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isMint ? 'bg-teal-500/10 text-teal-600' : 'bg-rose-500/10 text-rose-500'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className={`text-[10px] mt-2 line-clamp-2 leading-relaxed ${textSecondary}`}>
                        {teacher.description}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 self-center ${textSecondary}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slot-picker"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl mx-auto"
          >
            <button
              onClick={() => setSelectedTeacher(null)}
              className={`flex items-center text-xs font-black mb-6 hover:underline ${highlightText}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              返回导师列表
            </button>

            <div className={`rounded-[32px] p-6 border ${cardBgClass}`}>
              <div className="flex items-center space-x-4 pb-6 border-b border-white/5">
                <img
                  src={selectedTeacher.avatar}
                  alt={selectedTeacher.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-black">{selectedTeacher.name}</h2>
                  <div className="flex items-center text-xs mt-1">
                    <span className={textSecondary}>预约导师 availability </span>
                  </div>
                </div>
              </div>

              {loadingAvailability ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">查询档期中...</p>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center mb-4">
                      <Calendar className="w-3 h-3 mr-1.5 text-rose-500" />
                      选择日期 (Next 7 Days)
                    </h4>
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
                      {next7Days.map((day) => {
                        const isAvailable = isDayAvailable(day.dayOfWeek);
                        const isSelected = selectedDate === day.dateStr;
                        return (
                          <button
                            key={day.dateStr}
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedDate(day.dateStr);
                              setSelectedSlot(null);
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-16 transition-all border ${
                              isSelected
                                ? activeToggleColor
                                : isAvailable
                                ? isDark ? 'bg-white/5 border-white/10 hover:border-rose-500/50' : 'bg-slate-50 border-slate-200 hover:border-rose-500/50'
                                : 'opacity-30 cursor-not-allowed border-transparent'
                            }`}
                          >
                            <span className={`text-[9px] font-black ${isSelected ? 'text-white/80' : textSecondary}`}>
                              {day.dayName}
                            </span>
                            <span className="text-xs font-black mt-1">
                              {day.displayDate}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedDate && (
                      <motion.div
                        key={selectedDate}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                      >
                        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center mb-4">
                          <Clock className="w-3 h-3 mr-1.5 text-rose-500" />
                          可约时间段 (Available Slots)
                        </h4>
                        
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {availableSlots.map((slot) => {
                              const isSelected = selectedSlot === slot.time;
                              return (
                                <button
                                  key={slot.time}
                                  disabled={slot.isBooked}
                                  onClick={() => setSelectedSlot(slot.time)}
                                  className={`py-3 rounded-xl text-xs font-black border transition-all ${
                                    isSelected
                                      ? activeToggleColor
                                      : slot.isBooked
                                      ? 'bg-zinc-800/10 border-transparent text-zinc-500 cursor-not-allowed'
                                      : isDark ? 'bg-white/5 border-white/10 hover:border-rose-500/50' : 'bg-slate-50 border-slate-200 hover:border-rose-500/50'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 opacity-50 text-[10px] font-black">
                            该日期导师暂无空余时段
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-zinc-500">扣减课次: <span className="text-rose-500">2 课次 (Private)</span></div>
                  <div className="text-[9px] font-bold text-zinc-500 mt-1">余额 Private Balance: {privatePasses}</div>
                </div>
                <button
                  disabled={!selectedSlot || isSubmitting}
                  onClick={() => setIsModalOpen(true)}
                  className={`px-8 py-3 rounded-full text-xs font-black shadow-lg transition-all active:scale-95 flex items-center space-x-2 ${
                    !selectedSlot || isSubmitting
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50 shadow-none'
                      : ctaBtnColor
                  }`}
                >
                  <span>申请预约</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`mt-6 p-5 rounded-[24px] border ${cardBgClass} opacity-60`}>
              <h4 className={`text-[10px] font-black flex items-center mb-3 tracking-wider ${highlightText}`}>
                <span className={`w-1.5 h-1.5 rounded-full border-2 ${isMint ? 'border-teal-500' : 'border-rose-500'} mr-2 inline-block`}></span>
                私教须知
              </h4>
              <ul className="text-[9px] font-bold space-y-2 leading-relaxed text-zinc-500">
                <li>• 每次私教课消耗 2 个私教专用课次点数。</li>
                <li>• 需提前 24 小时取消，否则课次不予退回。</li>
                <li>• 申请提交后，导师将在 24 小时内完成确认。</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md rounded-[32px] p-6 border shadow-2xl ${cardBgClass}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">确认私教申请</h3>
                <button onClick={() => setIsModalOpen(false)} className={textSecondary}><X className="w-5 h-5" /></button>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
                <img src={selectedTeacher.avatar} alt={selectedTeacher.name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <div className="text-xs font-black opacity-50 uppercase tracking-wider">预约导师</div>
                  <div className="font-black">{selectedTeacher.name}</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className={textSecondary}>日期</span>
                  <span className="font-black">{selectedDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={textSecondary}>时间</span>
                  <span className="font-black">{selectedSlot}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={textSecondary}>扣减点数</span>
                  <span className="font-black text-rose-500">2 课次</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">训练备注 (可选)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="想提高的基础、特定编舞等..."
                  className={`w-full h-24 p-4 rounded-2xl text-xs font-medium border transition-all resize-none focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:ring-rose-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-rose-500/30'
                  }`}
                  maxLength={200}
                />
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleBook}
                className={`w-full py-4 rounded-2xl text-sm font-black shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 ${ctaBtnColor}`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>提交预约申请</span>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
