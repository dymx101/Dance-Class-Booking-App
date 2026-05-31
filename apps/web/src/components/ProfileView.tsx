import React, { useState } from 'react';
import { DanceClass, PurchaseRecord } from '@dance-app/shared';
import { Award, Clock, History, Ban, User, Layers, ShieldCheck, Ticket, BarChart3, HelpCircle, Flame, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface ProfileViewProps {
  theme?: string;
  setTheme?: React.Dispatch<React.SetStateAction<string>>;
  userPasses: number;
  setUserPasses: React.Dispatch<React.SetStateAction<number>>;
  bookedClassIds: string[];
  setBookedClassIds: React.Dispatch<React.SetStateAction<string[]>>;
  waitlistClassIds: string[];
  setWaitlistClassIds: React.Dispatch<React.SetStateAction<string[]>>;
  classes: DanceClass[];
  setClasses: React.Dispatch<React.SetStateAction<DanceClass[]>>;
  purchaseHistory: PurchaseRecord[];
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  bookedSpots?: Record<string, string>;
  setBookedSpots?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onLogout?: () => void;
  onToggleAdmin?: () => void;
  onOpenNotifications?: () => void;
}

export default function ProfileView({
  theme = 'vibrant-light',
  setTheme,
  userPasses,
  setUserPasses,
  bookedClassIds,
  setBookedClassIds,
  waitlistClassIds,
  setWaitlistClassIds,
  classes,
  setClasses,
  purchaseHistory,
  addToast,
  bookedSpots = {},
  setBookedSpots,
  onLogout,
  onToggleAdmin,
  onOpenNotifications
}: ProfileViewProps) {
  const { profile, user } = useAuth();
  const { unreadCount } = useNotifications();
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  // Compute real user data
  const displayName = profile?.name || user?.phone?.replace(/^\+86/, '') || '新同学';
  const accountInfo = user?.phone || user?.email || '未绑定账户';
  const currentPasses = profile?.remainingpasses ?? userPasses;

  // Compute theme dependent layout classes
  const bgClass = isDark ? 'bg-[#0c0d14]' : isMint ? 'bg-[#F0F2FA]' : 'bg-[#FAF8F5]';
  const headerBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/65' : 'border-orange-100/30';
  const textWhite = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-slate-600';

  const cardBgClass = isDark ? 'bg-[#13141f] border-white/5 text-white' : isMint ? 'bg-white border-slate-200/50 text-slate-850 shadow-sm' : 'bg-white border-[#f2ede4] text-slate-800 shadow-sm';
  const cardBorder = isDark ? 'border-white/5' : isMint ? 'border-slate-200/50' : 'border-[#f2ede4]';
  const highlightText = isMint ? 'text-teal-600' : 'text-rose-500';
  const iconColor = isMint ? 'text-teal-500' : 'text-rose-500';

  // Navigation tabs for lower monitoring details: 'active' | 'waiting' | 'purchases'
  const [activeSegment, setActiveSegment] = useState<'active' | 'waiting' | 'purchases'>('active');

  // Active future booked class entities
  const userBookedClasses = classes.filter((item) => bookedClassIds.includes(item.id));

  // Active waitlisted class entities
  const userWaitlistedClasses = classes.filter((item) => waitlistClassIds.includes(item.id));

  // Handle Cancellation
  const handleCancelBooking = (clsId: string, title: string) => {
    setBookedClassIds((prev) => prev.filter((id) => id !== clsId));
    setUserPasses((prev) => prev + 1);
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === clsId) {
          // If class has reservedspots, free it
          const spot = bookedSpots[clsId];
          const newReserved = c.reservedspots ? c.reservedspots.filter(s => s !== spot) : [];
          return { 
            ...c, 
            bookedcount: Math.max(0, c.bookedcount - 1),
            reservedspots: newReserved
          };
        }
        return c;
      })
    );
    if (setBookedSpots) {
      setBookedSpots((prev) => {
        const copy = { ...prev };
        delete copy[clsId];
        return copy;
      });
    }
    addToast(`已成功取消 《${title}》 的大课预约，1课点退回钱包。`, 'info');
  };

  // Handle Waitlist dequeue
  const handleCancelWaitlist = (clsId: string, title: string) => {
    setWaitlistClassIds((prev) => prev.filter((id) => id !== clsId));
    addToast(`已成功退出 《${title}》 的候补排队。`, 'info');
  };

  // Styled Distribution bar helper
  const DANCE_STREAKS = [
    { genre: 'Jazz (爵士热舞风格)', percent: 55, color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { genre: 'Hiphop (街舞律动排练)', percent: 30, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
    { genre: 'Urban Choreography', percent: 15, color: 'bg-gradient-to-r from-violet-500 to-purple-600' }
  ];

  return (
    <div className={`flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 pb-20 pt-4 transition-colors duration-500 ${bgClass}`} id="profile-view-container">
      {/* Upper header */}
      <div className={`flex items-center justify-between pb-3 border-b ${headerBorder} mb-3`}>
        <div className="flex items-center space-x-4">
          <div>
            <h2 className={`text-sm font-black uppercase tracking-wider ${textWhite}`}>会员中心</h2>
            <p className="text-[8px] text-zinc-500 font-bold tracking-widest mt-1">PLANA SPECIAL STUDENT</p>
          </div>
          {onToggleAdmin && (
            <button
              onClick={onToggleAdmin}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                isMint 
                  ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500/20' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20'
              }`}
            >
              进入后台
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNotifications}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-all cursor-pointer ${
              isMint 
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500/20' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${
            isMint 
              ? 'bg-teal-500/10 border-teal-500/20 text-teal-600' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
          }`}>
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 1. Student Member Card Dashboard */}
      <div className={`mt-4 rounded-[32px] p-5 text-white relative overflow-hidden shadow-xl border ${
        isDark 
          ? 'bg-gradient-to-br from-[#181926] to-[#12131f] border-white/10' 
          : isMint 
          ? 'bg-gradient-to-br from-[#1f3737] to-[#111e1e] border-teal-800' 
          : 'bg-gradient-to-br from-[#2d2222] to-[#1a1213] border-[#3f2f30]'
      }`}>
        {/* Shiny graphics */}
        <div className={`absolute right-0 top-0 translate-x-8 -translate-y-8 w-32 h-32 rounded-full opacity-15 blur-2xl ${isMint ? 'bg-teal-400' : 'bg-rose-500'}`}></div>
        <div className={`absolute left-1/3 bottom-0 w-24 h-24 rounded-full opacity-10 blur-2xl ${isMint ? 'bg-emerald-400' : 'bg-pink-500'}`}></div>

        <div className="relative z-10 flex items-center space-x-4">
          <img
            src={profile?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
            alt="User Avatar"
            className={`w-13 h-13 rounded-full object-cover border-2 ${isMint ? 'border-teal-400' : 'border-rose-500'}`}
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-extrabold text-white text-sm block">{displayName}</span>
              <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded border leading-none ${
                isMint ? 'bg-teal-500/20 border-teal-400 text-teal-300' : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              }`}>LEAGUE LV.2</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-mono block mt-1 tracking-tight">绑定账户: {accountInfo}</span>
            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5 tracking-tighter opacity-70">UID: {profile?.id || user?.id || 'Loading...'}</span>
          </div>
        </div>

        {/* Numeric stats row */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/5 text-center font-mono relative z-10">
          <div>
            <span className="text-[9px] text-zinc-400 block font-bold font-sans">可用课充点</span>
            <span className={`text-base font-extrabold block mt-0.5 ${isMint ? 'text-teal-400' : 'text-rose-400'}`}>
              {currentPasses} 次
            </span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-400 block font-bold font-sans">累计时长</span>
            <span className="text-base font-extrabold text-white block mt-0.5 font-sans">
              42 小时
            </span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-400 block font-bold font-sans">首选舞圈</span>
            <span className={`text-[10px] font-black block mt-1.5 px-1 py-0.5 rounded font-sans scale-[0.95] truncate ${
              isMint ? 'bg-teal-500/10 border border-teal-500/20 text-teal-300' : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              Jazz爵士圈
            </span>
          </div>
        </div>
      </div>

      {/* NEW: Interactive Dynamic Theme Control Sandbox panel */}
      {setTheme && (
        <div className={`mt-4 p-4.5 rounded-[24px] border shadow-lg ${cardBgClass} ${cardBorder}`} id="theme-sandbox-selector">
          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center mb-3 text-zinc-400">
            <Layers className={`w-4 h-4 mr-2 ${highlightText}`} />
            主题视觉风格沙盒 / Style Palette
          </h3>
          <p className={`text-[10px] font-medium mb-3.5 leading-relaxed ${textSecondary}`}>
            配色太暗或不合胃口？点击下方即刻切换至全新研发的街舞潮牌专配调色盘系统，享受定制美学：
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setTheme('vibrant-light');
                addToast('已切换至：街舞潮牌高明度高对比度活力粉（Vibrant Light）', 'success');
              }}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                theme === 'vibrant-light'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-500 font-extrabold shadow-sm'
                  : isDark 
                  ? 'border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10' 
                  : 'border-slate-200 bg-slate-50 text-slate-705 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white"></div>
                <span>活力潮牌粉 (Vibrant Street Orange-Pink)</span>
              </div>
              <span className="text-[9px] font-black uppercase font-mono tracking-wider opacity-60">高对比暖调</span>
            </button>

            <button
              onClick={() => {
                setTheme('cool-mint');
                addToast('已切换至：春季街潮自然清新薄荷绿（Cool Mint）', 'success');
              }}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                theme === 'cool-mint'
                  ? 'bg-teal-500/10 border-teal-500 text-teal-605 text-teal-600 font-extrabold shadow-sm'
                  : isDark 
                  ? 'border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-teal-500 border border-white"></div>
                <span>薄荷森系绿 (Refreshing Cool Mint)</span>
              </div>
              <span className="text-[9px] font-black uppercase font-mono tracking-wider opacity-60">清新活力调</span>
            </button>

            <button
              onClick={() => {
                setTheme('midnight-cyber');
                addToast('已切换至：星空赛博沉浸式暗黑霓虹（Midnight Cyber）', 'success');
              }}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                theme === 'midnight-cyber'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-455 text-rose-400 font-extrabold shadow-sm'
                  : isDark 
                  ? 'border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#0c0d14] border border-rose-500"></div>
                <span>深邃网黑赛博 (Midnight Cyber Punk)</span>
              </div>
              <span className="text-[9px] font-black uppercase font-mono tracking-wider opacity-60">暗影霓虹调</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Visual Progress Distribution bars */}
      <div className={`mt-4 p-4.5 rounded-[24px] border shadow-lg ${cardBgClass} ${cardBorder}`} id="progress-statistics">
        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center mb-3 text-zinc-400">
          <BarChart3 className={`w-4 h-4 mr-2 ${highlightText}`} />
          舞圈偏向图谱 / Style Analysis
        </h3>

        <div className="space-y-3.5">
          {DANCE_STREAKS.map((style) => (
            <div key={style.genre}>
              <div className="flex justify-between text-[11px] font-sans mb-1 font-bold text-zinc-400">
                <span>{style.genre}</span>
                <span className={`font-mono ${highlightText}`}>{style.percent}%</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden p-0.5 border ${isDark ? 'bg-zinc-950/80 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                <div className={`${style.color} h-full rounded-full`} style={{ width: `${style.percent}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-4 pt-3.5 border-t flex items-center justify-between text-[9px] tracking-wide font-bold ${isDark ? 'border-white/5 text-zinc-500' : 'border-slate-200 text-slate-500'}`} id="streak-meter">
          <span className="flex items-center">
            <Flame className={`w-3.5 h-3.5 mr-1 animate-pulse ${iconColor}`} />
            连续执照打卡: <strong className={`ml-1 font-black ${highlightText}`}>5 天</strong>
          </span>
          <span>近期勋章经验点: 450 / 1000 EXP</span>
        </div>
      </div>

      {/* 3. Class Booking Monitor segments tabbed block */}
      <div className="mt-5" id="booking-monitor">
        {/* Navigation row selectors */}
        <div className={`flex border-b font-black text-xs ${headerBorder}`}>
          <button
            onClick={() => setActiveSegment('active')}
            className={`flex-1 py-2.5 text-center transition-all relative cursor-pointer ${
              activeSegment === 'active' 
                ? isMint 
                  ? 'text-teal-600 font-extrabold' 
                  : 'text-rose-500 font-extrabold' 
                : isDark 
                ? 'text-zinc-500 hover:text-white' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>已选课程 ({userBookedClasses.length})</span>
            {activeSegment === 'active' && (
              <span className={`absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full ${isMint ? 'bg-teal-500' : 'bg-rose-500'}`}></span>
            )}
          </button>

          <button
            onClick={() => setActiveSegment('waiting')}
            className={`flex-1 py-2.5 text-center transition-all relative cursor-pointer ${
              activeSegment === 'waiting' 
                ? isMint 
                  ? 'text-teal-600 font-extrabold' 
                  : 'text-rose-500 font-extrabold' 
                : isDark 
                ? 'text-zinc-500 hover:text-white' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>排队候补 ({userWaitlistedClasses.length})</span>
            {activeSegment === 'waiting' && (
              <span className={`absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full ${isMint ? 'bg-teal-500' : 'bg-rose-500'}`}></span>
            )}
          </button>

          <button
            onClick={() => setActiveSegment('purchases')}
            className={`flex-1 py-2.5 text-center transition-all relative cursor-pointer ${
              activeSegment === 'purchases' 
                ? isMint 
                  ? 'text-teal-605 text-teal-600 font-extrabold' 
                  : 'text-rose-500 font-extrabold' 
                : isDark 
                ? 'text-zinc-500 hover:text-white' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>交易流水 ({purchaseHistory.length})</span>
            {activeSegment === 'purchases' && (
              <span className={`absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full ${isMint ? 'bg-teal-500' : 'bg-rose-500'}`}></span>
            )}
          </button>
        </div>

        {/* Display contents */}
        <div className="mt-3.5 space-y-3">
          {activeSegment === 'active' && (
            userBookedClasses.length === 0 ? (
              <div className={`text-center p-8 rounded-[24px] border flex flex-col items-center shadow-lg ${cardBgClass} ${cardBorder}`}>
                <Ticket className={`w-8 h-8 mb-2 ${isDark ? 'text-zinc-700' : 'text-slate-300'}`} />
                <p className={`text-xs font-bold leading-normal ${textSecondary}`}>
                  您当前暂无已登记的大课活动。赶紧前往首页或课表选择新一课时吧！
                </p>
              </div>
            ) : (
              userBookedClasses.map((cls) => (
                <div key={cls.id} className={`border rounded-2xl p-4 flex justify-between items-center shadow-lg ${cardBgClass} ${cardBorder}`}>
                  <div>
                    <h4 className={`text-xs font-black leading-tight ${textWhite}`}>
                      {cls.title}
                    </h4>
                    <p className={`text-[10px] font-bold font-mono mt-1.5 ${highlightText}`}>
                      {cls.date} • {cls.timestart}~{cls.timeend}
                    </p>
                    <p className={`text-[9px] mt-1 font-bold ${textSecondary}`}>
                      导师: {cls.teacher.name} • {cls.classroom}
                    </p>
                    {bookedSpots && bookedSpots[cls.id] && (
                      <div className="mt-2.5">
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.7 rounded-md leading-none ${
                          isMint
                            ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          📍 已选位置: {bookedSpots[cls.id]}号位
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleCancelBooking(cls.id, cls.title)}
                    className={`px-3.5 py-1.5 active:scale-95 text-[10px] font-bold rounded-full transition cursor-pointer shrink-0 border ${
                      isMint
                        ? 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/20 text-teal-650'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-500'
                    }`}
                  >
                    取消预约
                  </button>
                </div>
              ))
            )
          )}

          {activeSegment === 'waiting' && (
            userWaitlistedClasses.length === 0 ? (
              <div className={`text-center p-8 rounded-[24px] border flex flex-col items-center shadow-lg ${cardBgClass} ${cardBorder}`}>
                <History className={`w-8 h-8 mb-2 ${isDark ? 'text-zinc-700' : 'text-slate-300'}`} />
                <p className={`text-xs font-bold leading-normal ${textSecondary}`}>
                  您当前并没有处于名额已满候补阶段的分册项目。
                </p>
              </div>
            ) : (
              userWaitlistedClasses.map((cls) => (
                <div key={cls.id} className={`border rounded-2xl p-4 flex justify-between items-center shadow-lg ${cardBgClass} ${cardBorder}`}>
                  <div>
                    <span className={`border text-[8px] font-black px-2 py-0.5 rounded-full leading-none mr-1.5 inline-block mb-1.5 ${
                      isMint 
                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-605 text-teal-650'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                      队列抢位候补中
                    </span>
                    <h4 className={`text-xs font-black leading-tight ${textWhite}`}>
                      {cls.title}
                    </h4>
                    <p className={`text-[10px] font-bold font-mono mt-1 ${textSecondary}`}>
                      {cls.date} • {cls.timestart}~{cls.timeend}
                    </p>
                    <p className={`text-[9px] font-bold mt-1 ${textSecondary}`}>
                      导师: {cls.teacher.name} • 已行使1点冻结锁定数
                    </p>
                  </div>

                  <button
                    onClick={() => handleCancelWaitlist(cls.id, cls.title)}
                    className={`px-3.5 py-1.5 active:scale-95 text-[10px] font-bold rounded-full transition cursor-pointer border ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    取消候补
                  </button>
                </div>
              ))
            )
          )}

          {activeSegment === 'purchases' && (
            purchaseHistory.length === 0 ? (
              <div className={`text-center p-8 rounded-[24px] border flex flex-col items-center shadow-lg ${cardBgClass} ${cardBorder}`}>
                <History className={`w-8 h-8 mb-2 ${isDark ? 'text-zinc-700' : 'text-slate-300'}`} />
                <p className={`text-xs font-bold leading-normal ${textSecondary}`}>
                  您最近并无卡包购买交易记录，首笔充值包享有新手立减。
                </p>
              </div>
            ) : (
              purchaseHistory.map((rec) => (
                <div key={rec.id} className={`border rounded-2xl p-4 flex justify-between items-center font-mono shadow-lg ${cardBgClass} ${cardBorder}`}>
                  <div>
                    <h4 className={`text-xs font-black leading-tight font-sans ${textWhite}`}>
                      {rec.cardName}
                    </h4>
                    <p className={`text-[9px] mt-1.5 leading-none font-bold ${textSecondary}`}>
                      购买完成: {rec.date} • 流水编号: {rec.id}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black block ${highlightText}`}>
                      + {rec.passesAdded === -1 ? '无限通点' : `${rec.passesAdded} 次`}
                    </span>
                    <span className={`text-[9px] block mt-1 ${textSecondary}`}>
                      付款 ¥{rec.price}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* 4. WeChat Account Logout option */}
      <div className="mt-6 mb-2" id="wechat-logout-block">
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            }
          }}
          className={`w-full py-4 border font-sans font-black text-xs rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 shadow-sm ${
            isDark 
              ? 'bg-[#181a25]/60 hover:bg-[#1f2130] border-white/5 text-rose-455 text-rose-400 hover:text-rose-350' 
              : 'bg-white border-slate-205 border-slate-200 text-rose-600 hover:bg-slate-50'
          }`}
          id="logout-action-btn"
        >
          <span>切换、退出当前微信号登录</span>
        </button>
      </div>

    </div>
  );
}
